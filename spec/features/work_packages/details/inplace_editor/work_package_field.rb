class WorkPackageField
  attr_reader :element

  def initialize(page, property_name)
    @property_name = property_name
    @element = page.find(field_selector)
  end

  def read_state_text
    @element.find('.inplace-edit--read-value span').text
  end

  def trigger_link
    @element.find trigger_link_selector
  end

  def trigger_link_selector
    'a.inplace-editing--trigger-link'
  end

  def field_selector
    ".work-package-field.work-packages--details--#{@property_name}"
  end

  def activate_edition
    trigger_link.click
  end

  def input_element
    @element.find('.focus-input')
  end

  def submit_by_click
    @element.find('.inplace-edit--control--save a').click
  end

  def submit_by_enter
    input_element.native.send_keys :return
  end

  def cancel_by_click
    cancel_link_selector = '.inplace-edit--control--cancel a'
    if @element.has_selector?(cancel_link_selector)
      @element.find(cancel_link_selector).click
    end
  end

  def cancel_by_escape
    input_element.native.send_keys :escape
  end

  def editable?
    trigger_link.visible? rescue false
  end

  def editing?
    @element.find('.inplace-edit--write').visible? rescue false
  end

  def errors_text
    @element.find('.inplace-edit--errors--text').text
  end

  def errors_element
    @element.find('.inplace-edit--errors')
  end
end
