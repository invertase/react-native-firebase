# frozen_string_literal: true
# RNFB CI vendored formula — do not install from third-party taps in workflows.
# Upstream: wix/homebrew-brew @ 8f636f84541e — AppleSimulatorUtils 0.9.12
# Update: see okf-bundle/ci-workflows/ios.md#pinned-homebrew-utilities

class Applesimutils < Formula
  desc "Apple simulator utilities"
  homepage "https://github.com/wix/AppleSimulatorUtils"
  url "https://github.com/wix/AppleSimulatorUtils/releases/download/0.9.12/AppleSimulatorUtils-0.9.12.tar.gz"
  sha256 "4d6d02311959388ff5c28e2f4781848dbe1ca07f34b1d81d273940e099020b09"

  bottle do
    root_url "https://github.com/wix/AppleSimulatorUtils/releases/download/0.9.12"

    sha256 arm64_big_sur: "3373d85ea6051e77865b0a22960eb0b5d63f3126c7c99232d0b6b9c83ee2c133"
    sha256 catalina:      "530e29950dba6d11ca6da6841d24b84d835f8215836664d6e6ce8b23acce4a51"
    sha256 mojave:        "3373d85ea6051e77865b0a22960eb0b5d63f3126c7c99232d0b6b9c83ee2c133"
    sha256 high_sierra:   "3373d85ea6051e77865b0a22960eb0b5d63f3126c7c99232d0b6b9c83ee2c133"
    sha256 sierra:        "3373d85ea6051e77865b0a22960eb0b5d63f3126c7c99232d0b6b9c83ee2c133"
    sha256 big_sur:       "3373d85ea6051e77865b0a22960eb0b5d63f3126c7c99232d0b6b9c83ee2c133"
  end

  depends_on xcode: ["8.0", :build]

  def install
    system "./buildForBrew.sh", prefix
  end

  test do
    system "#{bin}/applesimutils", "--help"
  end
end
