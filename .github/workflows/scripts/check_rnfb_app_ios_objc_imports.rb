# frozen_string_literal: true

# Fail closed when an Objective-C, Objective-C++, C or C++ source or header in
# packages/app/ios reaches through the Swift-owned Firebase boundary.
# Translation-phase line splices are applied before comments and literals are
# recognized so directives are inspected as the compiler sees them.
#
# Rules per file type:
# - Every scanned file: no Firebase headers (prefixed, such as
#   <FirebaseCore/FirebaseCore.h>, or unprefixed, such as "FIRApp.h" and
#   "FirebaseCore.h") and no `@import Firebase*;`.
# - Everything except `.m`: no generated Swift interface header. The `.m`
#   adapters are the one place that bridges into the Swift implementation.
# Directories that legitimately import Firebase (the dynamic ObjC bridge
# target and the macOS unit-test host stubs) are not scanned.
module RNFBAppIOSObjCImportGuard # rubocop:disable Metrics/ModuleLength
  module_function

  HORIZONTAL_WHITESPACE = '[ \t\f\v]*'
  HEADER_IMPORT_PREFIX = /
    \A#{HORIZONTAL_WHITESPACE}\##{HORIZONTAL_WHITESPACE}
    (?:import|include)#{HORIZONTAL_WHITESPACE}
  /x
  ANGLE_HEADER_IMPORT = /\G(?<header><[^>\n]+>)/
  QUOTED_HEADER_IMPORT = /\G(?<header>"[^"\n]+")/
  DEFAULT_ROOT = File.expand_path('../../../packages/app/ios', __dir__)
  SOURCE_EXTENSIONS = %w[.h .hpp .m .mm .c .cpp].freeze
  GENERATED_SWIFT_HEADER_EXTENSIONS = %w[.m].freeze
  UNSCANNED_DIRECTORIES = %w[RNFBFirebase RNFBFirebaseUnitTests RNFBAppUnitTests build].freeze
  MODULE_IMPORT = /
    \A#{HORIZONTAL_WHITESPACE}@#{HORIZONTAL_WHITESPACE}
    import[ \t\f\v]+(?<module>Firebase[A-Za-z0-9_.]*)
    #{HORIZONTAL_WHITESPACE};
  /x

  # rubocop:disable-next Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
  def mask_comments_and_raw_literals(source)
    output = +''
    state = :code
    escaped = false
    raw_terminator = nil
    index = 0

    while index < source.length
      char = source[index]
      following = source[index + 1]

      case state
      when :code
        if char == '/' && following == '/'
          output << '  '
          state = :line_comment
          index += 1
        elsif char == '/' && following == '*'
          output << '  '
          state = :block_comment
          index += 1
        elsif (raw_start = raw_string_start(source, index))
          raw_terminator, delimiter_end = raw_start
          output << (' ' * (delimiter_end - index + 1))
          state = :raw_string
          index = delimiter_end
        elsif char == '"'
          output << char
          state = :string
        elsif char == "'" && digit_separator?(source, index)
          output << ' '
        elsif char == "'"
          output << ' '
          state = :character
        else
          output << char
        end
      when :line_comment
        if char == "\n"
          output << char
          state = :code
        else
          output << ' '
        end
      when :block_comment
        if char == '*' && following == '/'
          output << '  '
          state = :code
          index += 1
        else
          output << comment_placeholder(char)
        end
      when :string
        output << char
        if escaped
          escaped = false
        elsif char == '\\'
          escaped = true
        elsif char == '"'
          state = :code
        end
      when :character
        output << comment_placeholder(char)
        if escaped
          escaped = false
        elsif char == '\\'
          escaped = true
        elsif char == "'"
          state = :code
        end
      when :raw_string
        if source[index, raw_terminator.length] == raw_terminator
          output << (' ' * raw_terminator.length)
          index += raw_terminator.length - 1
          state = :code
          raw_terminator = nil
        else
          output << comment_placeholder(char)
        end
      end

      index += 1
    end

    output
  end

  def comment_placeholder(char)
    char == "\n" ? "\n" : ' '
  end

  # C++14 digit separators (`1'000'000`, `0xFF'FF`) reuse the character-literal
  # quote. A quote inside a preprocessing number, which starts with a digit (or
  # `.` plus a digit), is a separator and must not open a character literal.
  # Literal prefixes (`u8'a'`, `L'a'`) belong to identifiers, so they are not.
  def digit_separator?(source, index)
    return false unless index.positive?
    return false unless source[index - 1].match?(/[0-9A-Za-z]/)
    return false unless source[index + 1]&.match?(/[0-9A-Fa-f]/)

    token_start = index
    token_start -= 1 while token_start.positive? && source[token_start - 1].match?(/[0-9A-Za-z_.']/)
    source[token_start, 2].match?(/\A(?:[0-9]|\.[0-9])/)
  end

  # rubocop:disable-next Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
  def raw_string_start(source, index)
    prefix = source[index..]&.match(/\A(?:u8|u|U|L)?R"/)&.[](0)
    return unless prefix
    return if index.positive? && source[index - 1].match?(/[A-Za-z0-9_]/)

    delimiter_start = index + prefix.length
    delimiter_end = source.index('(', delimiter_start)
    delimiter = delimiter_end && source[delimiter_start...delimiter_end]
    return unless delimiter && delimiter.length <= 16 && !delimiter.match?(/[\s\\()]/)

    [")#{delimiter}\"", delimiter_end]
  end

  # rubocop:disable-next Metrics/AbcSize, Metrics/MethodLength
  def splice_physical_lines(source)
    output = +''
    physical_line = 1
    logical_line_starts = [physical_line]
    index = 0

    while index < source.length
      if source[index] == '\\' && source[index + 1] == "\n"
        physical_line += 1
        index += 2
      elsif source[index] == '\\' && source[index + 1, 2] == "\r\n"
        physical_line += 1
        index += 3
      else
        char = source[index]
        output << char
        if char == "\n"
          physical_line += 1
          logical_line_starts << physical_line
        end
        index += 1
      end
    end

    [output, logical_line_starts]
  end

  def forbidden_header?(header, allow_generated_swift: false)
    normalized = header[1..-2].strip
    return true if normalized.match?(%r{\AFirebase[A-Za-z0-9_]*(?:/|\.h\z)})
    return true if normalized.match?(%r{(?:\A|/)FIR[A-Za-z0-9_]*\.h\z})

    !allow_generated_swift && normalized.match?(%r{(?:\A|/)[^/]+-Swift\.(?:h|inc)\z})
  end

  def scanned_sources(root)
    Dir.glob(File.join(root, '**', '*')).select do |path|
      next false unless SOURCE_EXTENSIONS.include?(File.extname(path)) && File.file?(path)

      relative_parts = path.delete_prefix("#{root}#{File::SEPARATOR}").split(File::SEPARATOR)
      !relative_parts.intersect?(UNSCANNED_DIRECTORIES)
    end
  end

  def imported_header(masked_line)
    prefix = HEADER_IMPORT_PREFIX.match(masked_line)
    return unless prefix

    offset = prefix.end(0)
    angle_match = ANGLE_HEADER_IMPORT.match(masked_line, offset)
    return angle_match[:header] if angle_match

    QUOTED_HEADER_IMPORT.match(masked_line, offset)&.[](:header)
  end

  # rubocop:disable-next Metrics/AbcSize, Metrics/MethodLength
  def violations(root)
    scanned_sources(root).flat_map do |path|
      allow_generated_swift = GENERATED_SWIFT_HEADER_EXTENSIONS.include?(File.extname(path))
      source = File.read(path)
      spliced_source, physical_line_starts = splice_physical_lines(source)
      masked_lines = mask_comments_and_raw_literals(spliced_source).lines
      spliced_source.lines.each_with_index.filter_map do |line, index|
        masked_line = masked_lines.fetch(index)
        header = imported_header(masked_line)
        module_match = MODULE_IMPORT.match(masked_line)
        next unless module_match || (header && forbidden_header?(header, allow_generated_swift: allow_generated_swift))

        "#{path}:#{physical_line_starts.fetch(index)}:#{line.strip}"
      end
    end
  end

  # CLI entry point. Returns the process exit status.
  def run(argv, out: $stdout, err: $stderr)
    root = argv.fetch(0, DEFAULT_ROOT)
    found = violations(root)
    unless found.empty?
      err.puts 'Forbidden Firebase or generated Swift import in packages/app iOS native source:'
      found.each { |violation| err.puts violation }
      return 1
    end

    out.puts "Checked #{root}: native source Firebase/Swift import boundary is clean"
    0
  end
end

exit(RNFBAppIOSObjCImportGuard.run(ARGV)) if $PROGRAM_NAME == __FILE__
