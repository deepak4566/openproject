#-- encoding: UTF-8
#-- copyright
# OpenProject is a project management system.
#
# Copyright (C) 2012-2013 the OpenProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# See doc/COPYRIGHT.rdoc for more details.
#++
require File.expand_path('../../test_helper', __FILE__)
require 'application_controller'

# Re-raise errors caught by the controller.
class ApplicationController; def rescue_action(e) raise e end; end

class ApplicationControllerTest < ActionController::TestCase
  include Redmine::I18n

  def setup
    super
    @controller = ApplicationController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  # check that all language files are valid
  def test_localization
    lang_files_count = Dir[Rails.root.join('config/locales/*.yml')].size
    Setting.available_languages = Setting.all_languages
    assert_equal lang_files_count, valid_languages.size
    valid_languages.each do |lang|
      assert set_language_if_valid(lang)
    end
    set_language_if_valid('en')
  end

  def test_call_hook_mixed_in
    assert @controller.respond_to?(:call_hook)
  end

  context "test_api_offset_and_limit" do
    context "without params" do
      should "return 0, 25" do
        assert_equal [0, 25], @controller.send(:api_offset_and_limit, {})
      end
    end

    context "with limit" do
      should "return 0, limit" do
        assert_equal [0, 30], @controller.send(:api_offset_and_limit, {:limit => 30})
      end

      should "not exceed 100" do
        assert_equal [0, 100], @controller.send(:api_offset_and_limit, {:limit => 120})
      end

      should "not be negative" do
        assert_equal [0, 25], @controller.send(:api_offset_and_limit, {:limit => -10})
      end
    end

    context "with offset" do
      should "return offset, 25" do
        assert_equal [10, 25], @controller.send(:api_offset_and_limit, {:offset => 10})
      end

      should "not be negative" do
        assert_equal [0, 25], @controller.send(:api_offset_and_limit, {:offset => -10})
      end

      context "and limit" do
        should "return offset, limit" do
          assert_equal [10, 50], @controller.send(:api_offset_and_limit, {:offset => 10, :limit => 50})
        end
      end
    end

    context "with page" do
      should "return offset, 25" do
        assert_equal [0, 25], @controller.send(:api_offset_and_limit, {:page => 1})
        assert_equal [50, 25], @controller.send(:api_offset_and_limit, {:page => 3})
      end

      should "not be negative" do
        assert_equal [0, 25], @controller.send(:api_offset_and_limit, {:page => 0})
        assert_equal [0, 25], @controller.send(:api_offset_and_limit, {:page => -2})
      end

      context "and limit" do
        should "return offset, limit" do
          assert_equal [0, 100], @controller.send(:api_offset_and_limit, {:page => 1, :limit => 100})
          assert_equal [200, 100], @controller.send(:api_offset_and_limit, {:page => 3, :limit => 100})
        end
      end
    end
  end
end
