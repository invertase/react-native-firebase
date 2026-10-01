# frozen_string_literal: true

# Fail closed when an Objective-C++ source in packages/app/ios reaches through
# the Swift-owned Firebase boundary. Translation-phase line splices are applied
# before comments and literals are recognized so directives are inspected as
# the compiler sees them.
module RNFBAppIOSObjCImportGuard # rubocop:disable Metrics/ModuleLength
  module_function

  HORIZONTAL_WHITESPACE = '[ \t\f\v]*'
  HEADER_IMPORT_PREFIX = /
    \A#{HORIZONTAL_WHITESPACE}\##{HORIZONTAL_WHITESPACE}
    (?:import|include)#{HORIZONTAL_WHITESPACE}
  /x
  ANGLE_HEADER_IMPORT = /\G(?<header><[^>\n]+>)/
  QUOTED_HEADER_IMPORT = /\G(?<header>"[^"\n]+")/
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

  def forbidden_header?(header)
    normalized = header[1..-2].strip
    normalized.match?(%r{\AFirebase[A-Za-z0-9_]*(?:/|\.h\z)}) ||
      normalized.match?(%r{(?:\A|/)[^/]+-Swift\.(?:h|inc)\z})
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
    Dir.glob(File.join(root, '**', '*.mm')).flat_map do |path|
      source = File.read(path)
      spliced_source, physical_line_starts = splice_physical_lines(source)
      masked_lines = mask_comments_and_raw_literals(spliced_source).lines
      spliced_source.lines.each_with_index.filter_map do |line, index|
        masked_line = masked_lines.fetch(index)
        header = imported_header(masked_line)
        module_match = MODULE_IMPORT.match(masked_line)
        next unless module_match || (header && forbidden_header?(header))

        "#{path}:#{physical_line_starts.fetch(index)}:#{line.strip}"
      end
    end
  end
end

if $PROGRAM_NAME == __FILE__
  root = ARGV.fetch(0, File.expand_path('../../../packages/app/ios', __dir__))
  violations = RNFBAppIOSObjCImportGuard.violations(root)
  unless violations.empty?
    warn 'Forbidden Firebase or generated Swift import in packages/app iOS Objective-C++ source:'
    violations.each { |violation| warn violation }
    exit 1
  end

  puts "Checked #{root}: Objective-C++ Firebase/Swift import boundary is clean"
end
