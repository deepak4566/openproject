Then /^I should (not )?see "([^"]*)"\s*\#.*$/ do |negative, name|
  steps %Q{
    Then I should #{negative}see "#{name}"
  }
end

Then /^I should (not )?see "([^"]*)" within "([^"]*)"\s*\#.*$/ do |negative, name, scope|
  steps %Q{
    Then I should #{negative}see "#{name}" within "#{scope}"
  }
end

When /^I click(?:| on) "([^"]*)"$/ do |name|
  click_link_or_button name
end

When /^(?:|I )jump to [Pp]roject "([^\"]*)"$/ do |project|
  begin
    find(:xpath, '//div[@id="quick-search"]/select[last()]').select project
  rescue Capybara::ElementNotFound
    click_link('Projects')
    find(:css, '#account-nav .chzn-results li', :text => project).click
  end
end

Then /^"([^"]*)" should be selected for "([^"]*)"$/ do |value, select_id|
  # that makes capybara wait for the ajax request
  find(:xpath, "//body")
  # if you wanna see ugly things, look at the following line
  (page.evaluate_script("$('#{select_id}').value") =~ /^#{value}$/).should be_present
end

Then /^"([^"]*)" should (not )?be selectable from "([^"]*)"$/ do |value, negative, select_id|
  #more page.evaluate ugliness
  find(:xpath, "//body")
  bool = negative ? false : true
  (page.evaluate_script("$('#{select_id}').select('option[value=#{value}]').first.disabled") =~ /^#{bool}$/).should be_present
end

# This does NOT trigger actual hovering by means of :hover.
# To use this, you have to adjust your stylesheet accordingly.
When /^I hover over "([^"]+)"$/ do |selector|
  page.execute_script "jQuery(#{selector.inspect}).addClass('hover');"
end

When /^I stop hovering over "([^"]*)"$/ do |selector|
  page.execute_script "jQuery(#{selector.inspect}).removeClass('hover');"
end

When /^(?:|I )continue with "([^"]*)" in "([^"]*)"$/ do |link, css_class|
  # makes the capybara click on the first link within css class of multiple occurences with same name 
  # use it only if you want to use the first occurence  
  first(css_class).click_link(link)
  
end
