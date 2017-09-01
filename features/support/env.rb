#-- encoding: UTF-8

#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2017 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2017 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

# IMPORTANT: This file is generated by cucumber-rails - edit at your own peril.
# It is recommended to regenerate this file in the future when you upgrade to a
# newer version of cucumber-rails. Consider adding your own code to a new file
# instead of editing this one. Cucumber will automatically load all features/**/*.rb
# files.

if ENV['COVERAGE']
  require 'simplecov'
  SimpleCov.start 'rails'
end

require 'cucumber/rails'
require 'cucumber/rspec/doubles'
require 'capybara-screenshot/cucumber'
require 'capybara-select2'
require 'factory_girl_rails'

# json-spec is used to specifiy our json-apis
require 'json_spec/cucumber'

# Load paths to ensure they are loaded before the plugin's paths.rbs.
# Plugin's path_to functions rely on being loaded after the core's path_to
# function, since they call super if they don't match and the core doesn't.
# So in case a plugin's path_to is loaded first, the core's path_to will
# overwrite it when loaded and the plugin's paths are not found.
require_relative 'paths.rb'

# Capybara defaults to XPath selectors rather than Webrat's default of CSS3. In
# order to ease the transition to Capybara we set the default here. If you'd
# prefer to use XPath just remove this line and adjust any selectors in your
# steps to use the XPath syntax.
Capybara.configure do |config|
  config.default_selector = :css
  config.default_max_wait_time = 5
  config.exact_options = true
  config.ignore_hidden_elements = true
  config.match = :one
  config.visible_text_only = true
end

unless (env_no = ENV['TEST_ENV_NUMBER'].to_i).zero?
  Capybara.server_port = 8888 + env_no

  # Give firefox some time to setup / load himself
  sleep env_no * 5
end

Capybara.register_driver :selenium do |app|
  require 'selenium/webdriver'
  Selenium::WebDriver::Firefox::Binary.path = ENV['FIREFOX_BINARY_PATH'] ||
                                              Selenium::WebDriver::Firefox::Binary.path

  profile = Selenium::WebDriver::Firefox::Profile.new
  profile['intl.accept_languages'] = 'en,en-us'
  profile['browser.startup.homepage_override.mstone'] = 'ignore'
  profile['startup.homepage_welcome_url.additional'] = 'about:blank'

  # need to disable marionette as noted
  # https://github.com/teamcapybara/capybara#capybara
  Capybara::Selenium::Driver.new(app,
                                 browser: :firefox,
                                 profile: profile,
                                 desired_capabilities: Selenium::WebDriver::Remote::Capabilities.firefox(marionette: false))
end

Capybara.javascript_driver = :selenium

# By default, any exception happening in your Rails application will bubble up
# to Cucumber so that your scenario will fail. This is a different from how
# your application behaves in the production environment, where an error page will
# be rendered instead.
#
# Sometimes we want to override this default behaviour and allow Rails to rescue
# exceptions and display an error page (just like when the app is running in production).
# Typical scenarios where you want to do this is when you test your error pages.
# There are two ways to allow Rails to rescue exceptions:
#
# 1) Tag your scenario (or feature) with @allow-rescue
#
# 2) Set the value below to true. Beware that doing this globally is not
# recommended as it will mask a lot of errors for you!
#
ActionController::Base.allow_rescue = false

# Remove/comment out the lines below if your app doesn't have a database.
# For some databases (like MongoDB and CouchDB) you may need to use :truncation instead.
begin
  DatabaseCleaner.strategy = :truncation
rescue NameError
  raise 'You need to add database_cleaner to your Gemfile (in the :test group) if you wish to use it.'
end

# You may also want to configure DatabaseCleaner to use different strategies for certain features and scenarios.
# See the DatabaseCleaner documentation for details. Example:
#
#   Before('@no-txn,@selenium,@culerity,@celerity,@javascript') do
#     # { except: [:widgets] } may not do what you expect here
#     # as tCucumber::Rails::Database.javascript_strategy overrides
#     # this setting.
#     DatabaseCleaner.strategy = :truncation
#   end
#
#   Before('~@no-txn', '~@selenium', '~@culerity', '~@celerity', '~@javascript') do
#     DatabaseCleaner.strategy = :transaction
#   end
#

# Possible values are :truncation and :transaction
# The :transaction strategy is faster, but might give you threading problems.
# See https://github.com/cucumber/cucumber-rails/blob/master/features/choose_javascript_database_strategy.feature
Cucumber::Rails::Database.javascript_strategy = :truncation

# Remove any modal dialog remaining from the scenarios which finish in an unclean state
Before do |_scenario|
  begin
    page.driver.browser.switch_to.alert.accept
  rescue
    Selenium::WebDriver::Error::NoAlertOpenError
  end
end

Before do
  if Capybara.current_driver == :poltergeist
    page.driver.headers = { "Accept-Language" => "en" }
  end
end

Before do
  FactoryGirl.create(:non_member)
  FactoryGirl.create(:anonymous_role)
end

# Capybara.register_driver :selenium do |app|
#     Capybara::Selenium::Driver.new(app, browser: :chrome)
# end
#

World(Capybara::Select2)
