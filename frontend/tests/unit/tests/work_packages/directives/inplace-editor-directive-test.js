//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
//++

/*jshint expr: true*/

describe('inplaceEditor Directive', function() {
  var compile, element, rootScope, scope, elementScope, $timeout, html,
  submitStub, updateWorkPackageStub, onSuccessSpy, onFailSpy, onFinallySpy,
  WorkPackageService, form, OverviewTabInplaceEditorConfig;

  form = {
    embedded: {
      payload: {
        props: {}
      }
    }
  };

  function triggerKey(element, keyCode) {
    var e = jQuery.Event("keypress");
    e.which = e.keyCode = keyCode;
    element.trigger(e);
  }

  beforeEach(angular.mock.module('openproject.uiComponents'));
  beforeEach(module('openproject.templates',
                    'openproject.models',
                    'openproject.api',
                    'openproject.layout',
                    'openproject.config',
                    'openproject.services'));
  beforeEach(inject(function(
    $rootScope, $compile, _$timeout_,
    _WorkPackageService_, _OverviewTabInplaceEditorConfig_) {
    html =
        '<h2 ' +
        'inplace-editor ' +
        'ined-type="text" ' +
        'ined-entity="workPackage" ' +
        'ined-attribute="subject" ' +
        'placeholder="The default text" ' +
        'title="{{ workPackage.props.subject }}" ' +
      '></h2>';

    element = angular.element(html);
    rootScope = $rootScope;
    scope = $rootScope.$new();
    $timeout = _$timeout_;
    WorkPackageService = _WorkPackageService_;
    OverviewTabInplaceEditorConfig = _OverviewTabInplaceEditorConfig_;

    compile = function() {
      element = angular.element(html);
      $compile(element)(scope);
      scope.$digest();
      elementScope = element.isolateScope();
    };
  }));

  describe('Work package is not editable', function() {
    beforeEach(function() {
      scope.workPackage = {
        props: {
          subject: 'Some subject',
          lockVersion: '1'
        },
        links: {
        }
      };
      compile();
      element.appendTo(document.body);
    });

    afterEach(function() {
      element.remove();
    });

    it('should not be editable', function() {
      expect(scope.isEditable).to.be.falsy;
    });

    describe('placeholder', function() {
      it('should not render the default text', function() {
        var text = element.find('.inplace-edit--read .inplace-edit--read-value span:first').text().trim();
        expect(text).to.eq('Some subject');
      });

      it('should set default text switch', function() {
        expect(elementScope.placeholderSet).to.be.false;
      });
    });
  });

  describe('Work package is editable', function() {
    beforeEach(function() {
      scope.workPackage = {
        props: {
          subject: 'Some subject',
          lockVersion: '1'
        },
        links: {
          updateImmediately: {
            fetch: function() { }
          }
        },
        form: form
      };
      compile();
      element.appendTo(document.body);
    });

    afterEach(function() {
      element.remove();
    });

    describe('scope', function() {
      describe('type', function() {
        context('text', function() {
          beforeEach(function() {
            elementScope.startEditing();
            scope.$digest();
          });
          it('should render a text input', function() {
            expect(element.find('.inplace-edit--write-value input[type="text"]').length).to.eq(1);
          });
        });
        context('wiki_textarea', function() {
          beforeEach(function() {
            scope.workPackage = {
              props: {
                subject: 'Some subject',
                lockVersion: '1',
                description: {
                  format: 'textile',
                  raw: '1\n2\n3',
                  html: '1\n2\n3'
                }
              },
              links: {
                updateImmediately: {
                  fetch: function() { }
                }
              },
              form: {
                embedded: {
                  payload: {
                    props: {
                      description: {
                        format: 'textile',
                        raw: '1\n2\n3',
                        html: '1\n2\n3'
                      }
                    }
                  }
                }
              }
            };
            html =
              '<h2 ' +
              'inplace-editor ' +
              'ined-type="wiki_textarea" ' +
              'ined-entity="workPackage" ' +
              'ined-attribute="description" ' +
              '></h2>';
            compile();
            elementScope.startEditing();
            scope.$digest();
          });
          it('should render a textarea', function() {
            expect(element.find('.inplace-edit--write-value textarea').length).to.eq(1);
          });
          it('should render the js toolbar', function() {
            expect(element.find('.inplace-edit--write-value .jstElements').length).to.eq(1);
          });
          it('should render a text formatting help link', function() {
            expect(element.find('.inplace-edit--write-value .jstb_help').length).to.eq(1);
          });
          it('should set textaria\'s row count according to the content\'s row length', function() {
            $timeout.flush();
            expect(element.find('.inplace-edit--write-value textarea').attr('rows')).to.eq('4');
          });
        });
      });
      describe('workPackage.links.updateImmediately', function() {
        context('present', function() {
          it('should render the inplace editor', function() {
            expect(element.find('.inplace-edit').length).to.eq(1);
          });
        });
        context('not present', function() {
          beforeEach(function() {
            scope.workPackage = {
              props: {
                subject: 'Some subject',
                lockVersion: '1'
              },
              links: { },
              form: form
            };
            compile();
          });
          it('should render the value without editing elements', function() {
            expect(element.find('.inplace-edit--icon-wrapper').length).to.eq(0);
          });
        });
      });
      describe('isBusy', function() {
        context('true', function() {
          beforeEach(function() {
            elementScope.startEditing();
            elementScope.isBusy = true;
            scope.$digest();
          });
          it('should disable the input', function() {
            expect(element.find('.inplace-edit--write-value input').prop('disabled')).to.eq(true);
          });
        });
      });
      describe('isEditing', function() {
        context('true', function() {
          beforeEach(function() {
            elementScope.isEditing = true;
            scope.$digest();
          });
          it('should render the edit block', function() {
            expect(element.find('.inplace-edit--write').length).to.eq(1);
          });
          it('should hide the read block', function() {
            expect(element.find('.inplace-edit--read').hasClass('ng-hide')).to.eq(true);
          });
        });
        context('false', function() {
          it('should not render the edit block', function() {
            expect(element.find('.inplace-edit--write').length).to.eq(0);
          });
          it('should not hide the read block', function() {
            expect(element.find('.inplace-edit--read').hasClass('ng-hide')).to.eq(false);
          });
        });
      });
      describe('submit', function() {
        var emptyPromiseResponse = {
          'then': _.noop,
          'catch': _.noop,
          'finally': _.noop
        };
        context('notify', function() {
          var updateSpy;
          beforeEach(function() {
            updateSpy = sinon.stub(scope.workPackage.links.updateImmediately, 'fetch').returns({
              then: function() {
                return emptyPromiseResponse;
              }
            });
          });
          xit('should be false for normal submit', function() {
            elementScope.submit(false);
            expect(updateSpy.args[0][0].ajax.url).to.contain('?notify=false');
          });
          xit('should be true for normal submit', function() {
            elementScope.submit(true);
            expect(updateSpy.args[0][0].ajax.url).to.contain('?notify=true');
          });
        });
        context('general', function() {
          beforeEach(function() {
            updateWorkPackageStub = sinon
              .stub(WorkPackageService, 'updateWorkPackage')
              .returns(emptyPromiseResponse);
            elementScope.submit();
          });
          it('should set the isBusy variable', function() {
            expect(elementScope.isBusy).to.eq(true);
          });
        });
        describe('callbacks', function() {
          describe('startEditing', function() {
            var registerActiveEditorScopeSpy;
            beforeEach(function() {
              registerActiveEditorScopeSpy = sinon.spy(
                OverviewTabInplaceEditorConfig,
                'registerActiveEditorScope'
              );
              elementScope.startEditing();
            });
            it('should register the scope to a list of actives', function() {
              registerActiveEditorScopeSpy.should.have.been.calledWith(elementScope);
            });
          });
          describe('discardEditing', function() {
            var deregisterActiveEditorScopeSpy;
            beforeEach(function() {
              deregisterActiveEditorScopeSpy = sinon.spy(
                OverviewTabInplaceEditorConfig,
                'deregisterActiveEditorScope'
              );
              elementScope.discardEditing();
              $timeout.flush();
            });
            it('should register the scope to a list of actives', function() {
              deregisterActiveEditorScopeSpy.should.have.been.calledWith(elementScope);
            });
          });
          describe('onSuccess', function() {
            var emitSpy, dispatchChangesSpy, acceptChangesSpy;
            beforeEach(function() {
              emitSpy = sinon.stub(elementScope, '$emit', function(eventName, callback) {
                if (eventName == 'workPackageRefreshRequired') {
                  callback(elementScope.entity);
                }
              });
              acceptChangesSpy = sinon.spy(elementScope, 'acceptChanges');
              dispatchChangesSpy = sinon.spy(OverviewTabInplaceEditorConfig, 'dispatchChanges');
              elementScope.onSuccess({
                subject: 'Oh well'
              });
            });
            it('should refresh the details view', function() {
              emitSpy.should.have.been.calledWith('workPackageRefreshRequired');
            });
            it('should switch to read view', function() {
              expect(elementScope.isEditing).to.eq(false);
            });
            it('should propagate changes to all editors', function() {
              dispatchChangesSpy.should.have.been.calledWith(elementScope.entity);
            });
          });
          describe('onFail', function() {
            var dispatchErrorsSpy;
            beforeEach(function() {
              dispatchErrorsSpy = sinon.spy(OverviewTabInplaceEditorConfig, 'dispatchErrors');
              elementScope.startEditing();
              sinon.stub(WorkPackageService, 'updateWorkPackage', function() {
                return {
                  then: angular.noop,
                  catch: function(cb) {
                    cb({
                      status: 500,
                      statusText: 'Nope'
                    });
                  }
                };
              });
              elementScope.submit();
            });
            it('should not leave the edit mode', function() {
              expect(elementScope.isEditing).to.eq(true);
            });
            it('should set the error', function() {
              expect(elementScope.error).to.eq('Nope');
            });
            it('should propagate errors to other editors', function() {
              dispatchErrorsSpy.should.have.been.calledWith({
                status: 500,
                statusText: 'Nope'
              });
            });
          });
          describe('onFinally', function() {
            beforeEach(function() {
              elementScope.startEditing();
              elementScope.isBusy = true;
              elementScope.onFinally();
            });
            it('should set isBusy to false', function() {
              expect(elementScope.isBusy).to.eq(false);
            });
          });
        });
        describe('response handling', function() {
          beforeEach(function() {
            onSuccessSpy = sinon.stub(elementScope, 'onSuccess');
            onFailSpy = sinon.stub(elementScope, 'onFail');
            onFinallySpy = sinon.stub(elementScope, 'onFinally');
          });
          context('successful response', function() {
            beforeEach(function() {
              updateWorkPackageStub = sinon.stub(WorkPackageService, 'updateWorkPackage').returns({
                'then': function(cb) {
                  cb();
                },
                'catch': _.noop,
                'finally': _.noop
              });
              elementScope.submit();
            });
            it('should call onSuccess callback', function() {
              onSuccessSpy.should.have.been.called;
            });
          });
          context('error response', function() {
            beforeEach(function() {
              updateWorkPackageStub = sinon.stub(WorkPackageService, 'updateWorkPackage').returns({
                'then': _.noop,
                'catch': function(cb) {
                  cb();
                },
                'finally': _.noop
              });
              elementScope.submit();
            });
            it('should call onFail callback', function() {
              onFailSpy.should.have.been.called;
            });
          });
        });
      });
    });

    it('should render the directive template', function() {
      expect(element.find('.inplace-edit').length).to.eq(1);
    });

    describe('read value block', function() {
      it('should be rendered', function() {
        expect(element.find('.inplace-edit--read').length).to.eq(1);
      });
      it('should have the value of the given attribute', function() {
        expect(element
          .find('.inplace-edit--read .inplace-edit--read-value span:first')
          .text().trim())
          .to.eq('Some subject');
      });

      context('edit link', function() {
        it('should not be hidden from the reader', function() {
          expect(element.find('.inplace-edit--icon-wrapper').length).to.eq(1);
          //it's in the viewport and not hidden by angular
          expect(element.find('.inplace-edit--icon-wrapper').closest('.ng-hide').length).to.eq(0);
        });
        it('should be accessible by tab', function() {
          // I suggest some manual test here as well for the screen reader
          expect(element.find('.inplace-edit--icon-wrapper a').attr('tabindex')).not.to.eq('-1');
        });
        it('should trigger the edit mode', function() {
          element.find('.inplace-editing--trigger-link').click();
          expect(elementScope.isEditing).to.eq(true);
        });
      });

      describe('default text', function() {
        beforeEach(function() {
          scope.workPackage = {
            props: {
              subject: '',
              lockVersion: '1'
            },
            links: {
              updateImmediately: {
                fetch: function() {}
              }
            },
            form: {
              embedded: {
                payload: {
                  props: {
                    description: {
                      raw: '1\n2\n3'
                    }
                  }
                }
              }
            }
          };

          compile();
        });

        it('should render the default text', function() {
          var text = element
            .find('.inplace-edit--read .inplace-edit--read-value span:first')
            .text().trim();

          expect(text).to.eq('The default text');
        });

        it('should set default text switch', function() {
          expect(elementScope.placeholderSet).to.be.true;
        });
      });
    });
    describe('edit mode', function() {
      beforeEach(function() {
        elementScope.startEditing();
        scope.$digest();
        $timeout.flush();
      });
      it('should leave edit mode on ESC', function() {
        triggerKey(element, 27);
        expect(elementScope.isEditing).to.eq(false);
      });
      context('input', function() {
        it('should be focused', function() {
          expect(element.find('.inplace-edit--write-value input').get(0)).to.eq(document.activeElement);
        });
        it('should call submit on RETURN pressed', function() {
          submitStub = sinon.stub(elementScope, 'submit').returns(false);
          // pressing enter triggers form submit (default browser behaviour)
          element.find('.inplace-edit--write-value').closest('form').triggerHandler('submit');
          submitStub.should.have.been.calledWith(false);
          submitStub.restore();
        });
      });
      context('action buttons', function() {
        it('should be rendered', function() {
          expect(element.find('.inplace-edit--control--save').length).to.eq(1);
          expect(element.find('.inplace-edit--control--send').length).to.eq(1);
          expect(element.find('.inplace-edit--control--cancel').length).to.eq(1);
        });
        describe('save', function() {
          beforeEach(function() {
            submitStub = sinon.stub(elementScope, 'submit').returns(true);
            element.find('.inplace-edit--control--save a').click();
            elementScope.submit();
          });
          afterEach(function() {
            submitStub.restore();
          });
          it('should call submit with sendEmail=false', function() {
            submitStub.should.have.been.calledWith(false);
          });
        });
        describe('save and send', function() {
          beforeEach(function() {
            submitStub = sinon.stub(elementScope, 'submit').returns(false);
            element.find('.inplace-edit--control--send a').click();
            elementScope.submit();
          });
          afterEach(function() {
            submitStub.restore();
          });
          it('should call submit with sendEmail=true', function() {
            submitStub.should.have.been.calledWith(true);
          });
        });
        describe('cancel', function() {
          beforeEach(function() {
            element.find('.inplace-edit--control--cancel a').click();
          });
          it('should switch back to read mode', function() {
            expect(elementScope.isEditing).to.eq(false);
          });
          it('should focus the edit link', function() {
            $timeout.flush();
            expect(element.find('.inplace-editing--trigger-link').get(0)).to.eq(document.activeElement);
          });
        });
      });
    });
  });
});
