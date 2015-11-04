export function loadEmojiDependencies() {
        (function (root, factory) {
          if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define(["jquery"], function ($) {
              return (root.returnExportsGlobal = factory($));
            });
          } else if (typeof exports === 'object') {
            // Node. Does not work with strict CommonJS, but
            // only CommonJS-like enviroments that support module.exports,
            // like Node.
            module.exports = factory(require("jquery"));
          } else {
            factory(jQuery);
          }
        }(this, function ($) {

        /*
          Implement Github like autocomplete mentions
          http://ichord.github.com/At.js

          Copyright (c) 2013 chord.luo@gmail.com
          Licensed under the MIT license.
        */

        /*
        本插件操作 textarea 或者 input 内的插入符
        只实现了获得插入符在文本框中的位置，我设置
        插入符的位置.
        */

        "use strict";
        var EditableCaret, InputCaret, Mirror, Utils, discoveryIframeOf, methods, oDocument, oFrame, oWindow, pluginName, setContextBy;

        pluginName = 'caret';

        EditableCaret = (function() {
          function EditableCaret($inputor) {
            this.$inputor = $inputor;
            this.domInputor = this.$inputor[0];
          }

          EditableCaret.prototype.setPos = function(pos) {
            return this.domInputor;
          };

          EditableCaret.prototype.getIEPosition = function() {
            return this.getPosition();
          };

          EditableCaret.prototype.getPosition = function() {
            var inputor_offset, offset;
            offset = this.getOffset();
            inputor_offset = this.$inputor.offset();
            offset.left -= inputor_offset.left;
            offset.top -= inputor_offset.top;
            return offset;
          };

          EditableCaret.prototype.getOldIEPos = function() {
            var preCaretTextRange, textRange;
            textRange = oDocument.selection.createRange();
            preCaretTextRange = oDocument.body.createTextRange();
            preCaretTextRange.moveToElementText(this.domInputor);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            return preCaretTextRange.text.length;
          };

          EditableCaret.prototype.getPos = function() {
            var clonedRange, pos, range;
            if (range = this.range()) {
              clonedRange = range.cloneRange();
              clonedRange.selectNodeContents(this.domInputor);
              clonedRange.setEnd(range.endContainer, range.endOffset);
              pos = clonedRange.toString().length;
              clonedRange.detach();
              return pos;
            } else if (oDocument.selection) {
              return this.getOldIEPos();
            }
          };

          EditableCaret.prototype.getOldIEOffset = function() {
            var range, rect;
            range = oDocument.selection.createRange().duplicate();
            range.moveStart("character", -1);
            rect = range.getBoundingClientRect();
            return {
              height: rect.bottom - rect.top,
              left: rect.left,
              top: rect.top
            };
          };

          EditableCaret.prototype.getOffset = function(pos) {
            var clonedRange, offset, range, rect, shadowCaret;
            if (oWindow.getSelection && (range = this.range())) {
              if (range.endOffset - 1 > 0 && range.endContainer === !this.domInputor) {
                clonedRange = range.cloneRange();
                clonedRange.setStart(range.endContainer, range.endOffset - 1);
                clonedRange.setEnd(range.endContainer, range.endOffset);
                rect = clonedRange.getBoundingClientRect();
                offset = {
                  height: rect.height,
                  left: rect.left + rect.width,
                  top: rect.top
                };
                clonedRange.detach();
              }
              if (!offset || (offset != null ? offset.height : void 0) === 0) {
                clonedRange = range.cloneRange();
                shadowCaret = $(oDocument.createTextNode("|"));
                clonedRange.insertNode(shadowCaret[0]);
                clonedRange.selectNode(shadowCaret[0]);
                rect = clonedRange.getBoundingClientRect();
                offset = {
                  height: rect.height,
                  left: rect.left,
                  top: rect.top
                };
                shadowCaret.remove();
                clonedRange.detach();
              }
            } else if (oDocument.selection) {
              offset = this.getOldIEOffset();
            }
            if (offset) {
              offset.top += $(oWindow).scrollTop();
              offset.left += $(oWindow).scrollLeft();
            }
            return offset;
          };

          EditableCaret.prototype.range = function() {
            var sel;
            if (!oWindow.getSelection) {
              return;
            }
            sel = oWindow.getSelection();
            if (sel.rangeCount > 0) {
              return sel.getRangeAt(0);
            } else {
              return null;
            }
          };

          return EditableCaret;

        })();

        InputCaret = (function() {
          function InputCaret($inputor) {
            this.$inputor = $inputor;
            this.domInputor = this.$inputor[0];
          }

          InputCaret.prototype.getIEPos = function() {
            var endRange, inputor, len, normalizedValue, pos, range, textInputRange;
            inputor = this.domInputor;
            range = oDocument.selection.createRange();
            pos = 0;
            if (range && range.parentElement() === inputor) {
              normalizedValue = inputor.value.replace(/\r\n/g, "\n");
              len = normalizedValue.length;
              textInputRange = inputor.createTextRange();
              textInputRange.moveToBookmark(range.getBookmark());
              endRange = inputor.createTextRange();
              endRange.collapse(false);
              if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                pos = len;
              } else {
                pos = -textInputRange.moveStart("character", -len);
              }
            }
            return pos;
          };

          InputCaret.prototype.getPos = function() {
            if (oDocument.selection) {
              return this.getIEPos();
            } else {
              return this.domInputor.selectionStart;
            }
          };

          InputCaret.prototype.setPos = function(pos) {
            var inputor, range;
            inputor = this.domInputor;
            if (oDocument.selection) {
              range = inputor.createTextRange();
              range.move("character", pos);
              range.select();
            } else if (inputor.setSelectionRange) {
              inputor.setSelectionRange(pos, pos);
            }
            return inputor;
          };

          InputCaret.prototype.getIEOffset = function(pos) {
            var h, textRange, x, y;
            textRange = this.domInputor.createTextRange();
            pos || (pos = this.getPos());
            textRange.move('character', pos);
            x = textRange.boundingLeft;
            y = textRange.boundingTop;
            h = textRange.boundingHeight;
            return {
              left: x,
              top: y,
              height: h
            };
          };

          InputCaret.prototype.getOffset = function(pos) {
            var $inputor, offset, position;
            $inputor = this.$inputor;
            if (oDocument.selection) {
              offset = this.getIEOffset(pos);
              offset.top += $(oWindow).scrollTop() + $inputor.scrollTop();
              offset.left += $(oWindow).scrollLeft() + $inputor.scrollLeft();
              return offset;
            } else {
              offset = $inputor.offset();
              position = this.getPosition(pos);
              return offset = {
                left: offset.left + position.left - $inputor.scrollLeft(),
                top: offset.top + position.top - $inputor.scrollTop(),
                height: position.height
              };
            }
          };

          InputCaret.prototype.getPosition = function(pos) {
            var $inputor, at_rect, end_range, format, html, mirror, start_range;
            $inputor = this.$inputor;
            format = function(value) {
              value = value.replace(/<|>|`|"|&/g, '?').replace(/\r\n|\r|\n/g, "<br/>");
              if (/firefox/i.test(navigator.userAgent)) {
                value = value.replace(/\s/g, '&nbsp;');
              }
              return value;
            };
            if (pos === void 0) {
              pos = this.getPos();
            }
            start_range = $inputor.val().slice(0, pos);
            end_range = $inputor.val().slice(pos);
            html = "<span style='position: relative; display: inline;'>" + format(start_range) + "</span>";
            html += "<span id='caret' style='position: relative; display: inline;'>|</span>";
            html += "<span style='position: relative; display: inline;'>" + format(end_range) + "</span>";
            mirror = new Mirror($inputor);
            return at_rect = mirror.create(html).rect();
          };

          InputCaret.prototype.getIEPosition = function(pos) {
            var h, inputorOffset, offset, x, y;
            offset = this.getIEOffset(pos);
            inputorOffset = this.$inputor.offset();
            x = offset.left - inputorOffset.left;
            y = offset.top - inputorOffset.top;
            h = offset.height;
            return {
              left: x,
              top: y,
              height: h
            };
          };

          return InputCaret;

        })();

        Mirror = (function() {
          Mirror.prototype.css_attr = ["borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle", "borderTopWidth", "boxSizing", "fontFamily", "fontSize", "fontWeight", "height", "letterSpacing", "lineHeight", "marginBottom", "marginLeft", "marginRight", "marginTop", "outlineWidth", "overflow", "overflowX", "overflowY", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "textAlign", "textOverflow", "textTransform", "whiteSpace", "wordBreak", "wordWrap"];

          function Mirror($inputor) {
            this.$inputor = $inputor;
          }

          Mirror.prototype.mirrorCss = function() {
            var css,
              _this = this;
            css = {
              position: 'absolute',
              left: -9999,
              top: 0,
              zIndex: -20000
            };
            if (this.$inputor.prop('tagName') === 'TEXTAREA') {
              this.css_attr.push('width');
            }
            $.each(this.css_attr, function(i, p) {
              return css[p] = _this.$inputor.css(p);
            });
            return css;
          };

          Mirror.prototype.create = function(html) {
            this.$mirror = $('<div></div>');
            this.$mirror.css(this.mirrorCss());
            this.$mirror.html(html);
            this.$inputor.after(this.$mirror);
            return this;
          };

          Mirror.prototype.rect = function() {
            var $flag, pos, rect;
            $flag = this.$mirror.find("#caret");
            pos = $flag.position();
            rect = {
              left: pos.left,
              top: pos.top,
              height: $flag.height()
            };
            this.$mirror.remove();
            return rect;
          };

          return Mirror;

        })();

        Utils = {
          contentEditable: function($inputor) {
            return !!($inputor[0].contentEditable && $inputor[0].contentEditable === 'true');
          }
        };

        methods = {
          pos: function(pos) {
            if (pos || pos === 0) {
              return this.setPos(pos);
            } else {
              return this.getPos();
            }
          },
          position: function(pos) {
            if (oDocument.selection) {
              return this.getIEPosition(pos);
            } else {
              return this.getPosition(pos);
            }
          },
          offset: function(pos) {
            var offset;
            offset = this.getOffset(pos);
            return offset;
          }
        };

        oDocument = null;

        oWindow = null;

        oFrame = null;

        setContextBy = function(settings) {
          var iframe;
          if (iframe = settings != null ? settings.iframe : void 0) {
            oFrame = iframe;
            oWindow = iframe.contentWindow;
            return oDocument = iframe.contentDocument || oWindow.document;
          } else {
            oFrame = void 0;
            oWindow = window;
            return oDocument = document;
          }
        };

        discoveryIframeOf = function($dom) {
          var error;
          oDocument = $dom[0].ownerDocument;
          oWindow = oDocument.defaultView || oDocument.parentWindow;
          try {
            return oFrame = oWindow.frameElement;
          } catch (_error) {
            error = _error;
          }
        };

        $.fn.caret = function(method, value, settings) {
          var caret;
          if (methods[method]) {
            if ($.isPlainObject(value)) {
              setContextBy(value);
              value = void 0;
            } else {
              setContextBy(settings);
            }
            caret = Utils.contentEditable(this) ? new EditableCaret(this) : new InputCaret(this);
            return methods[method].apply(caret, [value]);
          } else {
            return $.error("Method " + method + " does not exist on jQuery.caret");
          }
        };

        $.fn.caret.EditableCaret = EditableCaret;

        $.fn.caret.InputCaret = InputCaret;

        $.fn.caret.Utils = Utils;

        $.fn.caret.apis = methods;


        }));
        /*! jquery.atwho - v1.3.2 %>
        * Copyright (c) 2015 chord.luo <chord.luo@gmail.com>;
        * homepage: http://ichord.github.com/At.js
        * Licensed MIT
        */
        (function (root, factory) {
          if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module unless amdModuleId is set
            define(["jquery"], function (a0) {
              return (factory(a0));
            });
          } else if (typeof exports === 'object') {
            // Node. Does not work with strict CommonJS, but
            // only CommonJS-like environments that support module.exports,
            // like Node.
            module.exports = factory(require("jquery"));
          } else {
            factory(jQuery);
          }
        }(this, function (jquery) {

        var $, Api, App, Controller, DEFAULT_CALLBACKS, EditableController, KEY_CODE, Model, TextareaController, View,
          slice = [].slice,
          extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
          hasProp = {}.hasOwnProperty;

        $ = jquery;

        App = (function() {
          function App(inputor) {
            this.currentFlag = null;
            this.controllers = {};
            this.aliasMaps = {};
            this.$inputor = $(inputor);
            this.setupRootElement();
            this.listen();
          }

          App.prototype.createContainer = function(doc) {
            var ref;
            if ((ref = this.$el) != null) {
              ref.remove();
            }
            return $(doc.body).append(this.$el = $("<div class='atwho-container'></div>"));
          };

          App.prototype.setupRootElement = function(iframe, asRoot) {
            var error;
            if (asRoot == null) {
              asRoot = false;
            }
            if (iframe) {
              this.window = iframe.contentWindow;
              this.document = iframe.contentDocument || this.window.document;
              this.iframe = iframe;
            } else {
              this.document = this.$inputor[0].ownerDocument;
              this.window = this.document.defaultView || this.document.parentWindow;
              try {
                this.iframe = this.window.frameElement;
              } catch (_error) {
                error = _error;
                this.iframe = null;
                if ($.fn.atwho.debug) {
                  throw new Error("iframe auto-discovery is failed.\nPlease use `setIframe` to set the target iframe manually.\n" + error);
                }
              }
            }
            return this.createContainer((this.iframeAsRoot = asRoot) ? this.document : document);
          };

          App.prototype.controller = function(at) {
            var c, current, currentFlag, ref;
            if (this.aliasMaps[at]) {
              current = this.controllers[this.aliasMaps[at]];
            } else {
              ref = this.controllers;
              for (currentFlag in ref) {
                c = ref[currentFlag];
                if (currentFlag === at) {
                  current = c;
                  break;
                }
              }
            }
            if (current) {
              return current;
            } else {
              return this.controllers[this.currentFlag];
            }
          };

          App.prototype.setContextFor = function(at) {
            this.currentFlag = at;
            return this;
          };

          App.prototype.reg = function(flag, setting) {
            var base, controller;
            controller = (base = this.controllers)[flag] || (base[flag] = this.$inputor.is('[contentEditable]') ? new EditableController(this, flag) : new TextareaController(this, flag));
            if (setting.alias) {
              this.aliasMaps[setting.alias] = flag;
            }
            controller.init(setting);
            return this;
          };

          App.prototype.listen = function() {
            return this.$inputor.on('compositionstart', (function(_this) {
              return function(e) {
                var ref;
                if ((ref = _this.controller()) != null) {
                  ref.view.hide();
                }
                console.log("compositionstart");
                _this.isComposing = true;
                return null;
              };
            })(this)).on('compositionend', (function(_this) {
              return function(e) {
                console.log("compositionend");
                _this.isComposing = false;
                return null;
              };
            })(this)).on('keyup.atwhoInner', (function(_this) {
              return function(e) {
                return _this.onKeyup(e);
              };
            })(this)).on('keydown.atwhoInner', (function(_this) {
              return function(e) {
                return _this.onKeydown(e);
              };
            })(this)).on('blur.atwhoInner', (function(_this) {
              return function(e) {
                var c;
                if (c = _this.controller()) {
                  c.expectedQueryCBId = null;
                  return c.view.hide(e, c.getOpt("displayTimeout"));
                }
              };
            })(this)).on('click.atwhoInner', (function(_this) {
              return function(e) {
                return _this.dispatch(e);
              };
            })(this)).on('scroll.atwhoInner', (function(_this) {
              return function() {
                var lastScrollTop;
                lastScrollTop = _this.$inputor.scrollTop();
                return function(e) {
                  var currentScrollTop, ref;
                  currentScrollTop = e.target.scrollTop;
                  if (lastScrollTop !== currentScrollTop) {
                    if ((ref = _this.controller()) != null) {
                      ref.view.hide(e);
                    }
                  }
                  lastScrollTop = currentScrollTop;
                  return true;
                };
              };
            })(this)());
          };

          App.prototype.shutdown = function() {
            var _, c, ref;
            ref = this.controllers;
            for (_ in ref) {
              c = ref[_];
              c.destroy();
              delete this.controllers[_];
            }
            this.$inputor.off('.atwhoInner');
            return this.$el.remove();
          };

          App.prototype.dispatch = function(e) {
            var _, c, ref, results;
            ref = this.controllers;
            results = [];
            for (_ in ref) {
              c = ref[_];
              results.push(c.lookUp(e));
            }
            return results;
          };

          App.prototype.onKeyup = function(e) {
            var ref;
            switch (e.keyCode) {
              case KEY_CODE.ESC:
                e.preventDefault();
                if ((ref = this.controller()) != null) {
                  ref.view.hide();
                }
                break;
              case KEY_CODE.DOWN:
              case KEY_CODE.UP:
              case KEY_CODE.CTRL:
              case KEY_CODE.ENTER:
                $.noop();
                break;
              case KEY_CODE.P:
              case KEY_CODE.N:
                if (!e.ctrlKey) {
                  this.dispatch(e);
                }
                break;
              default:
                this.dispatch(e);
            }
          };

          App.prototype.onKeydown = function(e) {
            var ref, view;
            view = (ref = this.controller()) != null ? ref.view : void 0;
            if (!(view && view.visible())) {
              return;
            }
            switch (e.keyCode) {
              case KEY_CODE.ESC:
                e.preventDefault();
                view.hide(e);
                break;
              case KEY_CODE.UP:
                e.preventDefault();
                view.prev();
                break;
              case KEY_CODE.DOWN:
                e.preventDefault();
                view.next();
                break;
              case KEY_CODE.P:
                if (!e.ctrlKey) {
                  return;
                }
                e.preventDefault();
                view.prev();
                break;
              case KEY_CODE.N:
                if (!e.ctrlKey) {
                  return;
                }
                e.preventDefault();
                view.next();
                break;
              case KEY_CODE.TAB:
              case KEY_CODE.ENTER:
              case KEY_CODE.SPACE:
                if (!view.visible()) {
                  return;
                }
                if (!this.controller().getOpt('spaceSelectsMatch') && e.keyCode === KEY_CODE.SPACE) {
                  return;
                }
                if (!this.controller().getOpt('tabSelectsMatch') && e.keyCode === KEY_CODE.TAB) {
                  return;
                }
                if (view.highlighted()) {
                  e.preventDefault();
                  view.choose(e);
                } else {
                  view.hide(e);
                }
                break;
              default:
                $.noop();
            }
          };

          return App;

        })();

        Controller = (function() {
          Controller.prototype.uid = function() {
            return (Math.random().toString(16) + "000000000").substr(2, 8) + (new Date().getTime());
          };

          function Controller(app1, at1) {
            this.app = app1;
            this.at = at1;
            this.$inputor = this.app.$inputor;
            this.id = this.$inputor[0].id || this.uid();
            this.expectedQueryCBId = null;
            this.setting = null;
            this.query = null;
            this.pos = 0;
            this.range = null;
            if ((this.$el = $("#atwho-ground-" + this.id, this.app.$el)).length === 0) {
              this.app.$el.append(this.$el = $("<div id='atwho-ground-" + this.id + "'></div>"));
            }
            this.model = new Model(this);
            this.view = new View(this);
          }

          Controller.prototype.init = function(setting) {
            this.setting = $.extend({}, this.setting || $.fn.atwho["default"], setting);
            this.view.init();
            return this.model.reload(this.setting.data);
          };

          Controller.prototype.destroy = function() {
            this.trigger('beforeDestroy');
            this.model.destroy();
            this.view.destroy();
            return this.$el.remove();
          };

          Controller.prototype.callDefault = function() {
            var args, error, funcName;
            funcName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            try {
              return DEFAULT_CALLBACKS[funcName].apply(this, args);
            } catch (_error) {
              error = _error;
              return $.error(error + " Or maybe At.js doesn't have function " + funcName);
            }
          };

          Controller.prototype.trigger = function(name, data) {
            var alias, eventName;
            if (data == null) {
              data = [];
            }
            data.push(this);
            alias = this.getOpt('alias');
            eventName = alias ? name + "-" + alias + ".atwho" : name + ".atwho";
            return this.$inputor.trigger(eventName, data);
          };

          Controller.prototype.callbacks = function(funcName) {
            return this.getOpt("callbacks")[funcName] || DEFAULT_CALLBACKS[funcName];
          };

          Controller.prototype.getOpt = function(at, default_value) {
            var e;
            try {
              return this.setting[at];
            } catch (_error) {
              e = _error;
              return null;
            }
          };

          Controller.prototype.insertContentFor = function($li) {
            var data, tpl;
            tpl = this.getOpt('insertTpl');
            data = $.extend({}, $li.data('item-data'), {
              'atwho-at': this.at
            });
            return this.callbacks("tplEval").call(this, tpl, data, "onInsert");
          };

          Controller.prototype.renderView = function(data) {
            var searchKey;
            searchKey = this.getOpt("searchKey");
            data = this.callbacks("sorter").call(this, this.query.text, data.slice(0, 1001), searchKey);
            return this.view.render(data.slice(0, this.getOpt('limit')));
          };

          Controller.arrayToDefaultHash = function(data) {
            var i, item, len, results;
            if (!$.isArray(data)) {
              return data;
            }
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              item = data[i];
              if ($.isPlainObject(item)) {
                results.push(item);
              } else {
                results.push({
                  name: item
                });
              }
            }
            return results;
          };

          Controller.prototype.lookUp = function(e) {
            var query, wait;
            if (e && e.type === 'click' && !this.getOpt('lookUpOnClick')) {
              return;
            }
            if (this.getOpt('suspendOnComposing') && this.app.isComposing) {
              return;
            }
            query = this.catchQuery(e);
            if (!query) {
              this.expectedQueryCBId = null;
              return query;
            }
            this.app.setContextFor(this.at);
            if (wait = this.getOpt('delay')) {
              this._delayLookUp(query, wait);
            } else {
              this._lookUp(query);
            }
            return query;
          };

          Controller.prototype._delayLookUp = function(query, wait) {
            var now, remaining;
            now = Date.now ? Date.now() : new Date().getTime();
            this.previousCallTime || (this.previousCallTime = now);
            remaining = wait - (now - this.previousCallTime);
            if ((0 < remaining && remaining < wait)) {
              this.previousCallTime = now;
              this._stopDelayedCall();
              return this.delayedCallTimeout = setTimeout((function(_this) {
                return function() {
                  _this.previousCallTime = 0;
                  _this.delayedCallTimeout = null;
                  return _this._lookUp(query);
                };
              })(this), wait);
            } else {
              this._stopDelayedCall();
              if (this.previousCallTime !== now) {
                this.previousCallTime = 0;
              }
              return this._lookUp(query);
            }
          };

          Controller.prototype._stopDelayedCall = function() {
            if (this.delayedCallTimeout) {
              clearTimeout(this.delayedCallTimeout);
              return this.delayedCallTimeout = null;
            }
          };

          Controller.prototype._generateQueryCBId = function() {
            return {};
          };

          Controller.prototype._lookUp = function(query) {
            var _callback;
            _callback = function(queryCBId, data) {
              if (queryCBId !== this.expectedQueryCBId) {
                return;
              }
              if (data && data.length > 0) {
                return this.renderView(this.constructor.arrayToDefaultHash(data));
              } else {
                return this.view.hide();
              }
            };
            this.expectedQueryCBId = this._generateQueryCBId();
            return this.model.query(query.text, $.proxy(_callback, this, this.expectedQueryCBId));
          };

          return Controller;

        })();

        TextareaController = (function(superClass) {
          extend(TextareaController, superClass);

          function TextareaController() {
            return TextareaController.__super__.constructor.apply(this, arguments);
          }

          TextareaController.prototype.catchQuery = function() {
            var caretPos, content, end, isString, query, start, subtext;
            content = this.$inputor.val();
            caretPos = this.$inputor.caret('pos', {
              iframe: this.app.iframe
            });
            subtext = content.slice(0, caretPos);
            query = this.callbacks("matcher").call(this, this.at, subtext, this.getOpt('startWithSpace'));
            isString = typeof query === 'string';
            if (isString && query.length < this.getOpt('minLen', 0)) {
              return;
            }
            if (isString && query.length <= this.getOpt('maxLen', 20)) {
              start = caretPos - query.length;
              end = start + query.length;
              this.pos = start;
              query = {
                'text': query,
                'headPos': start,
                'endPos': end
              };
              this.trigger("matched", [this.at, query.text]);
            } else {
              query = null;
              this.view.hide();
            }
            return this.query = query;
          };

          TextareaController.prototype.rect = function() {
            var c, iframeOffset, scaleBottom;
            if (!(c = this.$inputor.caret('offset', this.pos - 1, {
              iframe: this.app.iframe
            }))) {
              return;
            }
            if (this.app.iframe && !this.app.iframeAsRoot) {
              iframeOffset = $(this.app.iframe).offset();
              c.left += iframeOffset.left;
              c.top += iframeOffset.top;
            }
            scaleBottom = this.app.document.selection ? 0 : 2;
            return {
              left: c.left,
              top: c.top,
              bottom: c.top + c.height + scaleBottom
            };
          };

          TextareaController.prototype.insert = function(content, $li) {
            var $inputor, source, startStr, suffix, text;
            $inputor = this.$inputor;
            source = $inputor.val();
            startStr = source.slice(0, Math.max(this.query.headPos - this.at.length, 0));
            suffix = (suffix = this.getOpt('suffix')) === "" ? suffix : suffix || " ";
            content += suffix;
            text = "" + startStr + content + (source.slice(this.query['endPos'] || 0));
            $inputor.val(text);
            $inputor.caret('pos', startStr.length + content.length, {
              iframe: this.app.iframe
            });
            if (!$inputor.is(':focus')) {
              $inputor.focus();
            }
            return $inputor.change();
          };

          return TextareaController;

        })(Controller);

        EditableController = (function(superClass) {
          extend(EditableController, superClass);

          function EditableController() {
            return EditableController.__super__.constructor.apply(this, arguments);
          }

          EditableController.prototype._getRange = function() {
            var sel;
            sel = this.app.window.getSelection();
            if (sel.rangeCount > 0) {
              return sel.getRangeAt(0);
            }
          };

          EditableController.prototype._setRange = function(position, node, range) {
            if (range == null) {
              range = this._getRange();
            }
            if (!range) {
              return;
            }
            node = $(node)[0];
            if (position === 'after') {
              range.setEndAfter(node);
              range.setStartAfter(node);
            } else {
              range.setEndBefore(node);
              range.setStartBefore(node);
            }
            range.collapse(false);
            return this._clearRange(range);
          };

          EditableController.prototype._clearRange = function(range) {
            var sel;
            if (range == null) {
              range = this._getRange();
            }
            sel = this.app.window.getSelection();
            if (this.ctrl_a_pressed == null) {
              sel.removeAllRanges();
              return sel.addRange(range);
            }
          };

          EditableController.prototype._movingEvent = function(e) {
            var ref;
            return e.type === 'click' || ((ref = e.which) === KEY_CODE.RIGHT || ref === KEY_CODE.LEFT || ref === KEY_CODE.UP || ref === KEY_CODE.DOWN);
          };

          EditableController.prototype._unwrap = function(node) {
            var next;
            node = $(node).unwrap().get(0);
            if ((next = node.nextSibling) && next.nodeValue) {
              node.nodeValue += next.nodeValue;
              $(next).remove();
            }
            return node;
          };

          EditableController.prototype.catchQuery = function(e) {
            var $inserted, $query, _range, index, inserted, isString, lastNode, matched, offset, query, range;
            if (!(range = this._getRange())) {
              return;
            }
            if (e.which === KEY_CODE.CTRL) {
              this.ctrl_pressed = true;
            } else if (e.which === KEY_CODE.A) {
              if (this.ctrl_pressed == null) {
                this.ctrl_a_pressed = true;
              }
            } else {
              delete this.ctrl_a_pressed;
              delete this.ctrl_pressed;
            }
            if (e.which === KEY_CODE.ENTER) {
              ($query = $(range.startContainer).closest('.atwho-query')).contents().unwrap();
              if ($query.is(':empty')) {
                $query.remove();
              }
              ($query = $(".atwho-query", this.app.document)).text($query.text()).contents().last().unwrap();
              this._clearRange();
              return;
            }
            if (/firefox/i.test(navigator.userAgent)) {
              if ($(range.startContainer).is(this.$inputor)) {
                this._clearRange();
                return;
              }
              if (e.which === KEY_CODE.BACKSPACE && range.startContainer.nodeType === document.ELEMENT_NODE && (offset = range.startOffset - 1) >= 0) {
                _range = range.cloneRange();
                _range.setStart(range.startContainer, offset);
                if ($(_range.cloneContents()).contents().last().is('.atwho-inserted')) {
                  inserted = $(range.startContainer).contents().get(offset);
                  this._setRange('after', $(inserted).contents().last());
                }
              } else if (e.which === KEY_CODE.LEFT && range.startContainer.nodeType === document.TEXT_NODE) {
                $inserted = $(range.startContainer.previousSibling);
                if ($inserted.is('.atwho-inserted') && range.startOffset === 0) {
                  this._setRange('after', $inserted.contents().last());
                }
              }
            }
            $(range.startContainer).closest('.atwho-inserted').addClass('atwho-query').siblings().removeClass('atwho-query');
            if (($query = $(".atwho-query", this.app.document)).length > 0 && $query.is(':empty') && $query.text().length === 0) {
              $query.remove();
            }
            if (!this._movingEvent(e)) {
              $query.removeClass('atwho-inserted');
            }
            _range = range.cloneRange();
            _range.setStart(range.startContainer, 0);
            matched = this.callbacks("matcher").call(this, this.at, _range.toString(), this.getOpt('startWithSpace'));
            isString = typeof matched === 'string';
            if ($query.length === 0 && isString && (index = range.startOffset - this.at.length - matched.length) >= 0) {
              range.setStart(range.startContainer, index);
              $query = $('<span/>', this.app.document).attr(this.getOpt("editableAtwhoQueryAttrs")).addClass('atwho-query');
              range.surroundContents($query.get(0));
              lastNode = $query.contents().last().get(0);
              if (/firefox/i.test(navigator.userAgent)) {
                range.setStart(lastNode, lastNode.length);
                range.setEnd(lastNode, lastNode.length);
                this._clearRange(range);
              } else {
                this._setRange('after', lastNode, range);
              }
            }
            if (isString && matched.length < this.getOpt('minLen', 0)) {
              return;
            }
            if (isString && matched.length <= this.getOpt('maxLen', 20)) {
              query = {
                text: matched,
                el: $query
              };
              this.trigger("matched", [this.at, query.text]);
              return this.query = query;
            } else {
              this.view.hide();
              this.query = {
                el: $query
              };
              if ($query.text().indexOf(this.at) >= 0) {
                if (this._movingEvent(e) && $query.hasClass('atwho-inserted')) {
                  $query.removeClass('atwho-query');
                } else if (false !== this.callbacks('afterMatchFailed').call(this, this.at, $query)) {
                  this._setRange("after", this._unwrap($query.text($query.text()).contents().first()));
                }
              }
              return null;
            }
          };

          EditableController.prototype.rect = function() {
            var $iframe, iframeOffset, rect;
            rect = this.query.el.offset();
            if (this.app.iframe && !this.app.iframeAsRoot) {
              iframeOffset = ($iframe = $(this.app.iframe)).offset();
              rect.left += iframeOffset.left - this.$inputor.scrollLeft();
              rect.top += iframeOffset.top - this.$inputor.scrollTop();
            }
            rect.bottom = rect.top + this.query.el.height();
            return rect;
          };

          EditableController.prototype.insert = function(content, $li) {
            var range, suffix, suffixNode;
            suffix = (suffix = this.getOpt('suffix')) === "" ? suffix : suffix || "\u00A0";
            this.query.el.removeClass('atwho-query').addClass('atwho-inserted').html(content);
            if (range = this._getRange()) {
              range.setEndAfter(this.query.el[0]);
              range.collapse(false);
              range.insertNode(suffixNode = this.app.document.createTextNode(suffix));
              this._setRange('after', suffixNode, range);
            }
            if (!this.$inputor.is(':focus')) {
              this.$inputor.focus();
            }
            return this.$inputor.change();
          };

          return EditableController;

        })(Controller);

        Model = (function() {
          function Model(context) {
            this.context = context;
            this.at = this.context.at;
            this.storage = this.context.$inputor;
          }

          Model.prototype.destroy = function() {
            return this.storage.data(this.at, null);
          };

          Model.prototype.saved = function() {
            return this.fetch() > 0;
          };

          Model.prototype.query = function(query, callback) {
            var _remoteFilter, data, searchKey;
            data = this.fetch();
            searchKey = this.context.getOpt("searchKey");
            data = this.context.callbacks('filter').call(this.context, query, data, searchKey) || [];
            _remoteFilter = this.context.callbacks('remoteFilter');
            if (data.length > 0 || (!_remoteFilter && data.length === 0)) {
              return callback(data);
            } else {
              return _remoteFilter.call(this.context, query, callback);
            }
          };

          Model.prototype.fetch = function() {
            return this.storage.data(this.at) || [];
          };

          Model.prototype.save = function(data) {
            return this.storage.data(this.at, this.context.callbacks("beforeSave").call(this.context, data || []));
          };

          Model.prototype.load = function(data) {
            if (!(this.saved() || !data)) {
              return this._load(data);
            }
          };

          Model.prototype.reload = function(data) {
            return this._load(data);
          };

          Model.prototype._load = function(data) {
            if (typeof data === "string") {
              return $.ajax(data, {
                dataType: "json"
              }).done((function(_this) {
                return function(data) {
                  return _this.save(data);
                };
              })(this));
            } else {
              return this.save(data);
            }
          };

          return Model;

        })();

        View = (function() {
          function View(context) {
            this.context = context;
            this.$el = $("<div class='atwho-view'><ul class='atwho-view-ul'></ul></div>");
            this.timeoutID = null;
            this.context.$el.append(this.$el);
            this.bindEvent();
          }

          View.prototype.init = function() {
            var id;
            id = this.context.getOpt("alias") || this.context.at.charCodeAt(0);
            return this.$el.attr({
              'id': "at-view-" + id
            });
          };

          View.prototype.destroy = function() {
            return this.$el.remove();
          };

          View.prototype.bindEvent = function() {
            var $menu;
            $menu = this.$el.find('ul');
            return $menu.on('mouseenter.atwho-view', 'li', function(e) {
              $menu.find('.cur').removeClass('cur');
              return $(e.currentTarget).addClass('cur');
            }).on('click.atwho-view', 'li', (function(_this) {
              return function(e) {
                $menu.find('.cur').removeClass('cur');
                $(e.currentTarget).addClass('cur');
                _this.choose(e);
                return e.preventDefault();
              };
            })(this));
          };

          View.prototype.visible = function() {
            return this.$el.is(":visible");
          };

          View.prototype.highlighted = function() {
            return this.$el.find(".cur").length > 0;
          };

          View.prototype.choose = function(e) {
            var $li, content;
            if (($li = this.$el.find(".cur")).length) {
              content = this.context.insertContentFor($li);
              this.context.insert(this.context.callbacks("beforeInsert").call(this.context, content, $li), $li);
              this.context.trigger("inserted", [$li, e]);
              this.hide(e);
            }
            if (this.context.getOpt("hideWithoutSuffix")) {
              return this.stopShowing = true;
            }
          };

          View.prototype.reposition = function(rect) {
            var _window, offset, overflowOffset, ref;
            _window = this.context.app.iframeAsRoot ? this.context.app.window : window;
            if (rect.bottom + this.$el.height() - $(_window).scrollTop() > $(_window).height()) {
              rect.bottom = rect.top - this.$el.height();
            }
            if (rect.left > (overflowOffset = $(_window).width() - this.$el.width() - 5)) {
              rect.left = overflowOffset;
            }
            offset = {
              left: rect.left,
              top: rect.bottom
            };
            if ((ref = this.context.callbacks("beforeReposition")) != null) {
              ref.call(this.context, offset);
            }
            this.$el.offset(offset);
            return this.context.trigger("reposition", [offset]);
          };

          View.prototype.next = function() {
            var cur, next;
            cur = this.$el.find('.cur').removeClass('cur');
            next = cur.next();
            if (!next.length) {
              next = this.$el.find('li:first');
            }
            next.addClass('cur');
            return this.scrollTop(Math.max(0, cur.innerHeight() * (next.index() + 2) - this.$el.height()));
          };

          View.prototype.prev = function() {
            var cur, prev;
            cur = this.$el.find('.cur').removeClass('cur');
            prev = cur.prev();
            if (!prev.length) {
              prev = this.$el.find('li:last');
            }
            prev.addClass('cur');
            return this.scrollTop(Math.max(0, cur.innerHeight() * (prev.index() + 2) - this.$el.height()));
          };

          View.prototype.scrollTop = function(scrollTop) {
            var scrollDuration;
            scrollDuration = this.context.getOpt('scrollDuration');
            if (scrollDuration) {
              return this.$el.animate({
                scrollTop: scrollTop
              }, scrollDuration);
            } else {
              return this.$el.scrollTop(scrollTop);
            }
          };

          View.prototype.show = function() {
            var rect;
            if (this.stopShowing) {
              this.stopShowing = false;
              return;
            }
            if (!this.visible()) {
              this.$el.show();
              this.$el.scrollTop(0);
              this.context.trigger('shown');
            }
            if (rect = this.context.rect()) {
              return this.reposition(rect);
            }
          };

          View.prototype.hide = function(e, time) {
            var callback;
            if (!this.visible()) {
              return;
            }
            if (isNaN(time)) {
              this.$el.hide();
              return this.context.trigger('hidden', [e]);
            } else {
              callback = (function(_this) {
                return function() {
                  return _this.hide();
                };
              })(this);
              clearTimeout(this.timeoutID);
              return this.timeoutID = setTimeout(callback, time);
            }
          };

          View.prototype.render = function(list) {
            var $li, $ul, i, item, len, li, tpl;
            if (!($.isArray(list) && list.length > 0)) {
              this.hide();
              return;
            }
            this.$el.find('ul').empty();
            $ul = this.$el.find('ul');
            tpl = this.context.getOpt('displayTpl');
            for (i = 0, len = list.length; i < len; i++) {
              item = list[i];
              item = $.extend({}, item, {
                'atwho-at': this.context.at
              });
              li = this.context.callbacks("tplEval").call(this.context, tpl, item, "onDisplay");
              $li = $(this.context.callbacks("highlighter").call(this.context, li, this.context.query.text));
              $li.data("item-data", item);
              $ul.append($li);
            }
            this.show();
            if (this.context.getOpt('highlightFirst')) {
              return $ul.find("li:first").addClass("cur");
            }
          };

          return View;

        })();

        KEY_CODE = {
          DOWN: 40,
          UP: 38,
          ESC: 27,
          TAB: 9,
          ENTER: 13,
          CTRL: 17,
          A: 65,
          P: 80,
          N: 78,
          LEFT: 37,
          UP: 38,
          RIGHT: 39,
          DOWN: 40,
          BACKSPACE: 8,
          SPACE: 32
        };

        DEFAULT_CALLBACKS = {
          beforeSave: function(data) {
            return Controller.arrayToDefaultHash(data);
          },
          matcher: function(flag, subtext, should_startWithSpace, acceptSpaceBar) {
            var _a, _y, match, regexp, space;
            flag = flag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            if (should_startWithSpace) {
              flag = '(?:^|\\s)' + flag;
            }
            _a = decodeURI("%C3%80");
            _y = decodeURI("%C3%BF");
            space = acceptSpaceBar ? "\ " : "";
            regexp = new RegExp(flag + "([A-Za-z" + _a + "-" + _y + "0-9_" + space + "\'\.\+\-]*)$|" + flag + "([^\\x00-\\xff]*)$", 'gi');
            match = regexp.exec(subtext);
            if (match) {
              return match[2] || match[1];
            } else {
              return null;
            }
          },
          filter: function(query, data, searchKey) {
            var _results, i, item, len;
            _results = [];
            for (i = 0, len = data.length; i < len; i++) {
              item = data[i];
              if (~new String(item[searchKey]).toLowerCase().indexOf(query.toLowerCase())) {
                _results.push(item);
              }
            }
            return _results;
          },
          remoteFilter: null,
          sorter: function(query, items, searchKey) {
            var _results, i, item, len;
            if (!query) {
              return items;
            }
            _results = [];
            for (i = 0, len = items.length; i < len; i++) {
              item = items[i];
              item.atwho_order = new String(item[searchKey]).toLowerCase().indexOf(query.toLowerCase());
              if (item.atwho_order > -1) {
                _results.push(item);
              }
            }
            return _results.sort(function(a, b) {
              return a.atwho_order - b.atwho_order;
            });
          },
          tplEval: function(tpl, map) {
            var error, template;
            template = tpl;
            try {
              if (typeof tpl !== 'string') {
                template = tpl(map);
              }
              return template.replace(/\$\{([^\}]*)\}/g, function(tag, key, pos) {
                return map[key];
              });
            } catch (_error) {
              error = _error;
              return "";
            }
          },
          highlighter: function(li, query) {
            var regexp;
            if (!query) {
              return li;
            }
            regexp = new RegExp(">\\s*(\\w*?)(" + query.replace("+", "\\+") + ")(\\w*)\\s*<", 'ig');
            return li.replace(regexp, function(str, $1, $2, $3) {
              return '> ' + $1 + '<strong>' + $2 + '</strong>' + $3 + ' <';
            });
          },
          beforeInsert: function(value, $li) {
            return value;
          },
          beforeReposition: function(offset) {
            return offset;
          },
          afterMatchFailed: function(at, el) {}
        };

        Api = {
          load: function(at, data) {
            var c;
            if (c = this.controller(at)) {
              return c.model.load(data);
            }
          },
          isSelecting: function() {
            var ref;
            return !!((ref = this.controller()) != null ? ref.view.visible() : void 0);
          },
          hide: function() {
            var ref;
            return (ref = this.controller()) != null ? ref.view.hide() : void 0;
          },
          reposition: function() {
            var c;
            if (c = this.controller()) {
              return c.view.reposition(c.rect());
            }
          },
          setIframe: function(iframe, asRoot) {
            this.setupRootElement(iframe, asRoot);
            return null;
          },
          run: function() {
            return this.dispatch();
          },
          destroy: function() {
            this.shutdown();
            return this.$inputor.data('atwho', null);
          }
        };

        $.fn.atwho = function(method) {
          var _args, result;
          _args = arguments;
          result = null;
          this.filter('textarea, input, [contenteditable=""], [contenteditable=true]').each(function() {
            var $this, app;
            if (!(app = ($this = $(this)).data("atwho"))) {
              $this.data('atwho', (app = new App(this)));
            }
            if (typeof method === 'object' || !method) {
              return app.reg(method.at, method);
            } else if (Api[method] && app) {
              return result = Api[method].apply(app, Array.prototype.slice.call(_args, 1));
            } else {
              return $.error("Method " + method + " does not exist on jQuery.atwho");
            }
          });
          if (result != null) {
            return result;
          } else {
            return this;
          }
        };

        $.fn.atwho["default"] = {
          at: void 0,
          alias: void 0,
          data: null,
          displayTpl: "<li>${name}</li>",
          insertTpl: "${atwho-at}${name}",
          callbacks: DEFAULT_CALLBACKS,
          searchKey: "name",
          suffix: void 0,
          hideWithoutSuffix: false,
          startWithSpace: true,
          highlightFirst: true,
          limit: 5,
          maxLen: 20,
          minLen: 0,
          displayTimeout: 300,
          delay: null,
          spaceSelectsMatch: false,
          tabSelectsMatch: true,
          editableAtwhoQueryAttrs: {},
          scrollDuration: 150,
          suspendOnComposing: true,
          lookUpOnClick: true
        };

        $.fn.atwho.debug = false;

        }));

}

export const emojiObject = {
            "bingo": "👍",
            "+1": "👍"
          , "-1": "👎"
          , "100": "💯"
          , "1234": "🔢"
          , "8ball": "🎱"
          , "a": "🅰️"
          , "ab": "🆎"
          , "abc": "🔤"
          , "abcd": "🔡"
          , "accept": "🉑"
          , "aerial_tramway": "🚡"
          , "airplane": "✈️"
          , "alarm_clock": "⏰"
          , "alien": "👽"
          , "ambulance": "🚑"
          , "anchor": "⚓"
          , "angel": "👼"
          , "anger": "💢"
          , "angry": "😠"
          , "anguished": "😧"
          , "ant": "🐜"
          , "apple": "🍎"
          , "aquarius": "♒"
          , "aries": "♈"
          , "arrow_backward": "◀️"
          , "arrow_double_down": "⏬"
          , "arrow_double_up": "⏫"
          , "arrow_down": "⬇️"
          , "arrow_down_small": "🔽"
          , "arrow_forward": "▶️"
          , "arrow_heading_down": "⤵️"
          , "arrow_heading_up": "⤴️"
          , "arrow_left": "⬅️"
          , "arrow_lower_left": "↙️"
          , "arrow_lower_right": "↘️"
          , "arrow_right": "➡️"
          , "arrow_right_hook": "↪️"
          , "arrow_up": "⬆️"
          , "arrow_up_down": "↕️"
          , "arrow_up_small": "🔼"
          , "arrow_upper_left": "↖️"
          , "arrow_upper_right": "↗️"
          , "arrows_clockwise": "🔃"
          , "arrows_counterclockwise": "🔄"
          , "art": "🎨"
          , "articulated_lorry": "🚛"
          , "astonished": "😲"
          , "atm": "🏧"
          , "b": "🅱️"
          , "baby": "👶"
          , "baby_bottle": "🍼"
          , "baby_chick": "🐤"
          , "baby_symbol": "🚼"
          , "back": "🔙"
          , "baggage_claim": "🛄"
          , "balloon": "🎈"
          , "ballot_box_with_check": "☑️"
          , "bamboo": "🎍"
          , "banana": "🍌"
          , "bangbang": "‼️"
          , "bank": "🏦"
          , "bar_chart": "📊"
          , "barber": "💈"
          , "baseball": "⚾️"
          , "basketball": "🏀"
          , "bath": "🛀"
          , "bathtub": "🛁"
          , "battery": "🔋"
          , "bear": "🐻"
          , "beer": "🍺"
          , "beers": "🍻"
          , "beetle": "🐞"
          , "beginner": "🔰"
          , "bell": "🔔"
          , "bento": "🍱"
          , "bicyclist": "🚴"
          , "bike": "🚲"
          , "bikini": "👙"
          , "bird": "🐦"
          , "birthday": "🎂"
          , "black_circle": "⚫"
          , "black_joker": "🃏"
          , "black_medium_small_square": "◾"
          , "black_medium_square": "◼️"
          , "black_nib": "✒️"
          , "black_small_square": "▪️"
          , "black_square": ""
          , "black_square_button": "🔲"
          , "blossom": "🌼"
          , "blowfish": "🐡"
          , "blue_book": "📘"
          , "blue_car": "🚙"
          , "blue_heart": "💙"
          , "blush": "😊"
          , "boar": "🐗"
          , "boat": "⛵"
          , "bomb": "💣"
          , "book": "📖"
          , "bookmark": "🔖"
          , "bookmark_tabs": "📑"
          , "books": "📚"
          , "boom": "💥"
          , "boot": "👢"
          , "bouquet": "💐"
          , "bow": "🙇"
          , "bowling": "🎳"
          , "bowtie": ""
          , "boy": "👦"
          , "bread": "🍞"
          , "bride_with_veil": "👰"
          , "bridge_at_night": "🌉"
          , "briefcase": "💼"
          , "broken_heart": "💔"
          , "bug": "🐛"
          , "bulb": "💡"
          , "bullettrain_front": "🚅"
          , "bullettrain_side": "🚄"
          , "bus": "🚌"
          , "busstop": "🚏"
          , "bust_in_silhouette": "👤"
          , "busts_in_silhouette": "👥"
          , "cactus": "🌵"
          , "cake": "🍰"
          , "calendar": "📆"
          , "calling": "📲"
          , "camel": "🐫"
          , "camera": "📷"
          , "cancer": "♋"
          , "candy": "🍬"
          , "capital_abcd": "🔠"
          , "capricorn": "♑"
          , "car": "🚗"
          , "card_index": "📇"
          , "carousel_horse": "🎠"
          , "cat": "🐱"
          , "cat2": "🐈"
          , "cd": "💿"
          , "chart": "💹"
          , "chart_with_downwards_trend": "📉"
          , "chart_with_upwards_trend": "📈"
          , "checkered_flag": "🏁"
          , "cherries": "🍒"
          , "cherry_blossom": "🌸"
          , "chestnut": "🌰"
          , "chicken": "🐔"
          , "children_crossing": "🚸"
          , "chocolate_bar": "🍫"
          , "christmas_tree": "🎄"
          , "church": "⛪"
          , "cinema": "🎦"
          , "circus_tent": "🎪"
          , "city_sunrise": "🌇"
          , "city_sunset": "🌆"
          , "cl": "🆑"
          , "clap": "👏"
          , "clapper": "🎬"
          , "clipboard": "📋"
          , "clock1": "🕐"
          , "clock10": "🕙"
          , "clock1030": "🕥"
          , "clock11": "🕚"
          , "clock1130": "🕦"
          , "clock12": "🕛"
          , "clock1230": "🕧"
          , "clock130": "🕜"
          , "clock2": "🕑"
          , "clock230": "🕝"
          , "clock3": "🕒"
          , "clock330": "🕞"
          , "clock4": "🕓"
          , "clock430": "🕟"
          , "clock5": "🕔"
          , "clock530": "🕠"
          , "clock6": "🕕"
          , "clock630": "🕡"
          , "clock7": "🕖"
          , "clock730": "🕢"
          , "clock8": "🕗"
          , "clock830": "🕣"
          , "clock9": "🕘"
          , "clock930": "🕤"
          , "closed_book": "📕"
          , "closed_lock_with_key": "🔐"
          , "closed_umbrella": "🌂"
          , "cloud": "☁️"
          , "clubs": "♣️"
          , "cn": "🇨🇳"
          , "cocktail": "🍸"
          , "coffee": "☕"
          , "cold_sweat": "😰"
          , "collision": "💥"
          , "computer": "💻"
          , "confetti_ball": "🎊"
          , "confounded": "😖"
          , "confused": "😕"
          , "congratulations": "㊗️"
          , "construction": "🚧"
          , "construction_worker": "👷"
          , "convenience_store": "🏪"
          , "cookie": "🍪"
          , "cool": "🆒"
          , "cop": "👮"
          , "copyright": "©️"
          , "corn": "🌽"
          , "couple": "👫"
          , "couple_with_heart": "💑"
          , "couplekiss": "💏"
          , "cow": "🐮"
          , "cow2": "🐄"
          , "credit_card": "💳"
          , "crocodile": "🐊"
          , "crossed_flags": "🎌"
          , "crown": "👑"
          , "cry": "😢"
          , "crying_cat_face": "😿"
          , "crystal_ball": "🔮"
          , "cupid": "💘"
          , "curly_loop": "➰"
          , "currency_exchange": "💱"
          , "curry": "🍛"
          , "custard": "🍮"
          , "customs": "🛃"
          , "cyclone": "🌀"
          , "dancer": "💃"
          , "dancers": "👯"
          , "dango": "🍡"
          , "dart": "🎯"
          , "dash": "💨"
          , "date": "📅"
          , "de": "🇩🇪"
          , "deciduous_tree": "🌳"
          , "department_store": "🏬"
          , "diamond_shape_with_a_dot_inside": "💠"
          , "diamonds": "♦️"
          , "disappointed": "😞"
          , "disappointed_relieved": "😥"
          , "dizzy": "💫"
          , "dizzy_face": "😵"
          , "do_not_litter": "🚯"
          , "dog": "🐶"
          , "dog2": "🐕"
          , "dollar": "💵"
          , "dolls": "🎎"
          , "dolphin": "🐬"
          , "door": "🚪"
          , "doughnut": "🍩"
          , "dragon": "🐉"
          , "dragon_face": "🐲"
          , "dress": "👗"
          , "dromedary_camel": "🐪"
          , "droplet": "💧"
          , "dvd": "📀"
          , "e-mail": "📧"
          , "ear": "👂"
          , "ear_of_rice": "🌾"
          , "earth_africa": "🌍"
          , "earth_americas": "🌎"
          , "earth_asia": "🌏"
          , "egg": "🍳"
          , "eggplant": "🍆"
          , "eight": "8️⃣"
          , "eight_pointed_black_star": "✴️"
          , "eight_spoked_asterisk": "✳️"
          , "electric_plug": "🔌"
          , "elephant": "🐘"
          , "email": "✉️"
          , "end": "🔚"
          , "envelope": "✉️"
          , "es": "🇪🇸"
          , "euro": "💶"
          , "european_castle": "🏰"
          , "european_post_office": "🏤"
          , "evergreen_tree": "🌲"
          , "exclamation": "❗"
          , "expressionless": "😑"
          , "eyeglasses": "👓"
          , "eyes": "👀"
          , "facepunch": "👊"
          , "factory": "🏭"
          , "fallen_leaf": "🍂"
          , "family": "👪"
          , "fast_forward": "⏩"
          , "fax": "📠"
          , "fearful": "😨"
          , "feelsgood": ""
          , "feet": "🐾"
          , "ferris_wheel": "🎡"
          , "file_folder": "📁"
          , "finnadie": ""
          , "fire": "🔥"
          , "fire_engine": "🚒"
          , "fireworks": "🎆"
          , "first_quarter_moon": "🌓"
          , "first_quarter_moon_with_face": "🌛"
          , "fish": "🐟"
          , "fish_cake": "🍥"
          , "fishing_pole_and_fish": "🎣"
          , "fist": "✊"
          , "five": "5️⃣"
          , "flags": "🎏"
          , "flashlight": "🔦"
          , "floppy_disk": "💾"
          , "flower_playing_cards": "🎴"
          , "flushed": "😳"
          , "foggy": "🌁"
          , "football": "🏈"
          , "fork_and_knife": "🍴"
          , "fountain": "⛲"
          , "four": "4️⃣"
          , "four_leaf_clover": "🍀"
          , "fr": "🇫🇷"
          , "free": "🆓"
          , "fried_shrimp": "🍤"
          , "fries": "🍟"
          , "frog": "🐸"
          , "frowning": "😦"
          , "fu": ""
          , "fuelpump": "⛽"
          , "full_moon": "🌕"
          , "full_moon_with_face": "🌝"
          , "game_die": "🎲"
          , "gb": "🇬🇧"
          , "gem": "💎"
          , "gemini": "♊"
          , "ghost": "👻"
          , "gift": "🎁"
          , "gift_heart": "💝"
          , "girl": "👧"
          , "globe_with_meridians": "🌐"
          , "goat": "🐐"
          , "goberserk": ""
          , "godmode": ""
          , "golf": "⛳"
          , "grapes": "🍇"
          , "green_apple": "🍏"
          , "green_book": "📗"
          , "green_heart": "💚"
          , "grey_exclamation": "❕"
          , "grey_question": "❔"
          , "grimacing": "😬"
          , "grin": "😁"
          , "grinning": "😀"
          , "guardsman": "💂"
          , "guitar": "🎸"
          , "gun": "🔫"
          , "haircut": "💇"
          , "hamburger": "🍔"
          , "hammer": "🔨"
          , "hamster": "🐹"
          , "hand": "✋"
          , "handbag": "👜"
          , "hankey": "💩"
          , "hash": "#️⃣"
          , "hatched_chick": "🐥"
          , "hatching_chick": "🐣"
          , "headphones": "🎧"
          , "hear_no_evil": "🙉"
          , "heart": "❤️"
          , "heart_decoration": "💟"
          , "heart_eyes": "😍"
          , "heart_eyes_cat": "😻"
          , "heartbeat": "💓"
          , "heartpulse": "💗"
          , "hearts": "♥️"
          , "heavy_check_mark": "✔️"
          , "heavy_division_sign": "➗"
          , "heavy_dollar_sign": "💲"
          , "heavy_exclamation_mark": "❗"
          , "heavy_minus_sign": "➖"
          , "heavy_multiplication_x": "✖️"
          , "heavy_plus_sign": "➕"
          , "helicopter": "🚁"
          , "herb": "🌿"
          , "hibiscus": "🌺"
          , "high_brightness": "🔆"
          , "high_heel": "👠"
          , "hocho": "🔪"
          , "honey_pot": "🍯"
          , "honeybee": "🐝"
          , "horse": "🐴"
          , "horse_racing": "🏇"
          , "hospital": "🏥"
          , "hotel": "🏨"
          , "hotsprings": "♨️"
          , "hourglass": "⌛"
          , "hourglass_flowing_sand": "⏳"
          , "house": "🏠"
          , "house_with_garden": "🏡"
          , "hurtrealbad": ""
          , "hushed": "😯"
          , "ice_cream": "🍨"
          , "icecream": "🍦"
          , "id": "🆔"
          , "ideograph_advantage": "🉐"
          , "imp": "👿"
          , "inbox_tray": "📥"
          , "incoming_envelope": "📨"
          , "information_desk_person": "💁"
          , "information_source": "ℹ️"
          , "innocent": "😇"
          , "interrobang": "⁉️"
          , "iphone": "📱"
          , "it": "🇮🇹"
          , "izakaya_lantern": "🏮"
          , "jack_o_lantern": "🎃"
          , "japan": "🗾"
          , "japanese_castle": "🏯"
          , "japanese_goblin": "👺"
          , "japanese_ogre": "👹"
          , "jeans": "👖"
          , "joy": "😂"
          , "joy_cat": "😹"
          , "jp": "🇯🇵"
          , "key": "🔑"
          , "keycap_ten": "🔟"
          , "kimono": "👘"
          , "kiss": "💋"
          , "kissing": "😗"
          , "kissing_cat": "😽"
          , "kissing_closed_eyes": "😚"
          , "kissing_heart": "😘"
          , "kissing_smiling_eyes": "😙"
          , "koala": "🐨"
          , "koko": "🈁"
          , "kr": "🇰🇷"
          , "large_blue_circle": "🔵"
          , "large_blue_diamond": "🔷"
          , "large_orange_diamond": "🔶"
          , "last_quarter_moon": "🌗"
          , "last_quarter_moon_with_face": "🌜"
          , "laughing": "😆"
          , "leaves": "🍃"
          , "ledger": "📒"
          , "left_luggage": "🛅"
          , "left_right_arrow": "↔️"
          , "leftwards_arrow_with_hook": "↩️"
          , "lemon": "🍋"
          , "leo": "♌"
          , "leopard": "🐆"
          , "libra": "♎"
          , "light_rail": "🚈"
          , "link": "🔗"
          , "lips": "👄"
          , "lipstick": "💄"
          , "lock": "🔒"
          , "lock_with_ink_pen": "🔏"
          , "lollipop": "🍭"
          , "loop": "➿"
          , "loudspeaker": "📢"
          , "love_hotel": "🏩"
          , "love_letter": "💌"
          , "low_brightness": "🔅"
          , "m": "Ⓜ️"
          , "mag": "🔍"
          , "mag_right": "🔎"
          , "mahjong": "🀄"
          , "mailbox": "📫"
          , "mailbox_closed": "📪"
          , "mailbox_with_mail": "📬"
          , "mailbox_with_no_mail": "📭"
          , "man": "👨"
          , "man_with_gua_pi_mao": "👲"
          , "man_with_turban": "👳"
          , "mans_shoe": "👞"
          , "maple_leaf": "🍁"
          , "mask": "😷"
          , "massage": "💆"
          , "meat_on_bone": "🍖"
          , "mega": "📣"
          , "melon": "🍈"
          , "memo": "📝"
          , "mens": "🚹"
          , "metal": ""
          , "metro": "🚇"
          , "microphone": "🎤"
          , "microscope": "🔬"
          , "milky_way": "🌌"
          , "minibus": "🚐"
          , "minidisc": "💽"
          , "mobile_phone_off": "📴"
          , "money_with_wings": "💸"
          , "moneybag": "💰"
          , "monkey": "🐒"
          , "monkey_face": "🐵"
          , "monorail": "🚝"
          , "moon": "🌔"
          , "mortar_board": "🎓"
          , "mount_fuji": "🗻"
          , "mountain_bicyclist": "🚵"
          , "mountain_cableway": "🚠"
          , "mountain_railway": "🚞"
          , "mouse": "🐭"
          , "mouse2": "🐁"
          , "movie_camera": "🎥"
          , "moyai": "🗿"
          , "muscle": "💪"
          , "mushroom": "🍄"
          , "musical_keyboard": "🎹"
          , "musical_note": "🎵"
          , "musical_score": "🎼"
          , "mute": "🔇"
          , "nail_care": "💅"
          , "name_badge": "📛"
          , "neckbeard": ""
          , "necktie": "👔"
          , "negative_squared_cross_mark": "❎"
          , "neutral_face": "😐"
          , "new": "🆕"
          , "new_moon": "🌑"
          , "new_moon_with_face": "🌚"
          , "newspaper": "📰"
          , "ng": "🆖"
          , "nine": "9️⃣"
          , "no_bell": "🔕"
          , "no_bicycles": "🚳"
          , "no_entry": "⛔"
          , "no_entry_sign": "🚫"
          , "no_good": "🙅"
          , "no_mobile_phones": "📵"
          , "no_mouth": "😶"
          , "no_pedestrians": "🚷"
          , "no_smoking": "🚭"
          , "non-potable_water": "🚱"
          , "nose": "👃"
          , "notebook": "📓"
          , "notebook_with_decorative_cover": "📔"
          , "notes": "🎶"
          , "nut_and_bolt": "🔩"
          , "o": "⭕"
          , "o2": "🅾️"
          , "ocean": "🌊"
          , "octocat": ""
          , "octopus": "🐙"
          , "oden": "🍢"
          , "office": "🏢"
          , "ok": "🆗"
          , "ok_hand": "👌"
          , "ok_woman": "🙆"
          , "older_man": "👴"
          , "older_woman": "👵"
          , "on": "🔛"
          , "oncoming_automobile": "🚘"
          , "oncoming_bus": "🚍"
          , "oncoming_police_car": "🚔"
          , "oncoming_taxi": "🚖"
          , "one": "1️⃣"
          , "open_file_folder": "📂"
          , "open_hands": "👐"
          , "open_mouth": "😮"
          , "ophiuchus": "⛎"
          , "orange_book": "📙"
          , "outbox_tray": "📤"
          , "ox": "🐂"
          , "package": "📦"
          , "page_facing_up": "📄"
          , "page_with_curl": "📃"
          , "pager": "📟"
          , "palm_tree": "🌴"
          , "panda_face": "🐼"
          , "paperclip": "📎"
          , "parking": "🅿️"
          , "part_alternation_mark": "〽️"
          , "partly_sunny": "⛅"
          , "passport_control": "🛂"
          , "paw_prints": "🐾"
          , "peach": "🍑"
          , "pear": "🍐"
          , "pencil": "📝"
          , "pencil2": "✏️"
          , "penguin": "🐧"
          , "pensive": "😔"
          , "performing_arts": "🎭"
          , "persevere": "😣"
          , "person_frowning": "🙍"
          , "person_with_blond_hair": "👱"
          , "person_with_pouting_face": "🙎"
          , "phone": "☎️"
          , "pig": "🐷"
          , "pig2": "🐖"
          , "pig_nose": "🐽"
          , "pill": "💊"
          , "pineapple": "🍍"
          , "pisces": "♓"
          , "pizza": "🍕"
          , "plus1": ""
          , "point_down": "👇"
          , "point_left": "👈"
          , "point_right": "👉"
          , "point_up": "☝️"
          , "point_up_2": "👆"
          , "police_car": "🚓"
          , "poodle": "🐩"
          , "poop": "💩"
          , "post_office": "🏣"
          , "postal_horn": "📯"
          , "postbox": "📮"
          , "potable_water": "🚰"
          , "pouch": "👝"
          , "poultry_leg": "🍗"
          , "pound": "💷"
          , "pouting_cat": "😾"
          , "pray": "🙏"
          , "princess": "👸"
          , "punch": "👊"
          , "purple_heart": "💜"
          , "purse": "👛"
          , "pushpin": "📌"
          , "put_litter_in_its_place": "🚮"
          , "question": "❓"
          , "rabbit": "🐰"
          , "rabbit2": "🐇"
          , "racehorse": "🐎"
          , "radio": "📻"
          , "radio_button": "🔘"
          , "rage": "😡"
          , "rage1": ""
          , "rage2": ""
          , "rage3": ""
          , "rage4": ""
          , "railway_car": "🚃"
          , "rainbow": "🌈"
          , "raised_hand": "✋"
          , "raised_hands": "🙌"
          , "raising_hand": "🙋"
          , "ram": "🐏"
          , "ramen": "🍜"
          , "rat": "🐀"
          , "recycle": "♻️"
          , "red_car": "🚗"
          , "red_circle": "🔴"
          , "registered": "®️"
          , "relaxed": "☺️"
          , "relieved": "😌"
          , "repeat": "🔁"
          , "repeat_one": "🔂"
          , "restroom": "🚻"
          , "revolving_hearts": "💞"
          , "rewind": "⏪"
          , "ribbon": "🎀"
          , "rice": "🍚"
          , "rice_ball": "🍙"
          , "rice_cracker": "🍘"
          , "rice_scene": "🎑"
          , "ring": "💍"
          , "rocket": "🚀"
          , "roller_coaster": "🎢"
          , "rooster": "🐓"
          , "rose": "🌹"
          , "rotating_light": "🚨"
          , "round_pushpin": "📍"
          , "rowboat": "🚣"
          , "ru": "🇷🇺"
          , "rugby_football": "🏉"
          , "runner": "🏃"
          , "running": "🏃"
          , "running_shirt_with_sash": "🎽"
          , "sa": "🈂️"
          , "sagittarius": "♐"
          , "sailboat": "⛵"
          , "sake": "🍶"
          , "sandal": "👡"
          , "santa": "🎅"
          , "satellite": "📡"
          , "satisfied": "😆"
          , "saxophone": "🎷"
          , "school": "🏫"
          , "school_satchel": "🎒"
          , "scissors": "✂️"
          , "scorpius": "♏"
          , "scream": "😱"
          , "scream_cat": "🙀"
          , "scroll": "📜"
          , "seat": "💺"
          , "secret": "㊙️"
          , "see_no_evil": "🙈"
          , "seedling": "🌱"
          , "seven": "7️⃣"
          , "shaved_ice": "🍧"
          , "sheep": "🐑"
          , "shell": "🐚"
          , "ship": "🚢"
          , "shipit": ""
          , "shirt": "👕"
          , "shit": "💩"
          , "shoe": "👞"
          , "shower": "🚿"
          , "signal_strength": "📶"
          , "six": "6️⃣"
          , "six_pointed_star": "🔯"
          , "ski": "🎿"
          , "skull": "💀"
          , "sleeping": "😴"
          , "sleepy": "😪"
          , "slot_machine": "🎰"
          , "small_blue_diamond": "🔹"
          , "small_orange_diamond": "🔸"
          , "small_red_triangle": "🔺"
          , "small_red_triangle_down": "🔻"
          , "smile": "😄"
          , "smile_cat": "😸"
          , "smiley": "😃"
          , "smiley_cat": "😺"
          , "smiling_imp": "😈"
          , "smirk": "😏"
          , "smirk_cat": "😼"
          , "smoking": "🚬"
          , "snail": "🐌"
          , "snake": "🐍"
          , "snowboarder": "🏂"
          , "snowflake": "❄️"
          , "snowman": "⛄"
          , "sob": "😭"
          , "soccer": "⚽"
          , "soon": "🔜"
          , "sos": "🆘"
          , "sound": "🔉"
          , "space_invader": "👾"
          , "spades": "♠️"
          , "spaghetti": "🍝"
          , "sparkle": "❇️"
          , "sparkler": "🎇"
          , "sparkles": "✨"
          , "sparkling_heart": "💖"
          , "speak_no_evil": "🙊"
          , "speaker": "🔈"
          , "speech_balloon": "💬"
          , "speedboat": "🚤"
          , "squirrel": ""
          , "star": "⭐"
          , "star2": "🌟"
          , "stars": "🌠"
          , "station": "🚉"
          , "statue_of_liberty": "🗽"
          , "steam_locomotive": "🚂"
          , "stew": "🍲"
          , "straight_ruler": "📏"
          , "strawberry": "🍓"
          , "stuck_out_tongue": "😛"
          , "stuck_out_tongue_closed_eyes": "😝"
          , "stuck_out_tongue_winking_eye": "😜"
          , "sun_with_face": "🌞"
          , "sunflower": "🌻"
          , "sunglasses": "😎"
          , "sunny": "☀️"
          , "sunrise": "🌅"
          , "sunrise_over_mountains": "🌄"
          , "surfer": "🏄"
          , "sushi": "🍣"
          , "suspect": ""
          , "suspension_railway": "🚟"
          , "sweat": "😓"
          , "sweat_drops": "💦"
          , "sweat_smile": "😅"
          , "sweet_potato": "🍠"
          , "swimmer": "🏊"
          , "symbols": "🔣"
          , "syringe": "💉"
          , "tada": "🎉"
          , "tanabata_tree": "🎋"
          , "tangerine": "🍊"
          , "taurus": "♉"
          , "taxi": "🚕"
          , "tea": "🍵"
          , "telephone": "☎️"
          , "telephone_receiver": "📞"
          , "telescope": "🔭"
          , "tennis": "🎾"
          , "tent": "⛺"
          , "thought_balloon": "💭"
          , "three": "3️⃣"
          , "thumbsdown": "👎"
          , "thumbsup": "👍"
          , "ticket": "🎫"
          , "tiger": "🐯"
          , "tiger2": "🐅"
          , "tired_face": "😫"
          , "tm": "™️"
          , "toilet": "🚽"
          , "tokyo_tower": "🗼"
          , "tomato": "🍅"
          , "tongue": "👅"
          , "top": "🔝"
          , "tophat": "🎩"
          , "tractor": "🚜"
          , "traffic_light": "🚥"
          , "train": "🚋"
          , "train2": "🚆"
          , "tram": "🚊"
          , "triangular_flag_on_post": "🚩"
          , "triangular_ruler": "📐"
          , "trident": "🔱"
          , "triumph": "😤"
          , "trolleybus": "🚎"
          , "trollface": ""
          , "trophy": "🏆"
          , "tropical_drink": "🍹"
          , "tropical_fish": "🐠"
          , "truck": "🚚"
          , "trumpet": "🎺"
          , "tshirt": "👕"
          , "tulip": "🌷"
          , "turtle": "🐢"
          , "tv": "📺"
          , "twisted_rightwards_arrows": "🔀"
          , "two": "2️⃣"
          , "two_hearts": "💕"
          , "two_men_holding_hands": "👬"
          , "two_women_holding_hands": "👭"
          , "u5272": "🈹"
          , "u5408": "🈴"
          , "u55b6": "🈺"
          , "u6307": "🈯"
          , "u6708": "🈷️"
          , "u6709": "🈶"
          , "u6e80": "🈵"
          , "u7121": "🈚"
          , "u7533": "🈸"
          , "u7981": "🈲"
          , "u7a7a": "🈳"
          , "uk": "🇬🇧"
          , "umbrella": "☔"
          , "unamused": "😒"
          , "underage": "🔞"
          , "unlock": "🔓"
          , "up": "🆙"
          , "us": "🇺🇸"
          , "v": "✌️"
          , "vertical_traffic_light": "🚦"
          , "vhs": "📼"
          , "vibration_mode": "📳"
          , "video_camera": "📹"
          , "video_game": "🎮"
          , "violin": "🎻"
          , "virgo": "♍"
          , "volcano": "🌋"
          , "vs": "🆚"
          , "walking": "🚶"
          , "waning_crescent_moon": "🌘"
          , "waning_gibbous_moon": "🌖"
          , "warning": "⚠️"
          , "watch": "⌚"
          , "water_buffalo": "🐃"
          , "watermelon": "🍉"
          , "wave": "👋"
          , "wavy_dash": "〰️"
          , "waxing_crescent_moon": "🌒"
          , "waxing_gibbous_moon": "🌔"
          , "wc": "🚾"
          , "weary": "😩"
          , "wedding": "💒"
          , "whale": "🐳"
          , "whale2": "🐋"
          , "wheelchair": "♿"
          , "white_check_mark": "✅"
          , "white_circle": "⚪"
          , "white_flower": "💮"
          , "white_large_square": "⬜"
          , "white_medium_small_square": "◽"
          , "white_medium_square": "◻️"
          , "white_small_square": "▫️"
          , "white_square_button": "🔳"
          , "wind_chime": "🎐"
          , "wine_glass": "🍷"
          , "wink": "😉"
          , "wolf": "🐺"
          , "woman": "👩"
          , "womans_clothes": "👚"
          , "womans_hat": "👒"
          , "womens": "🚺"
          , "worried": "😟"
          , "wrench": "🔧"
          , "x": "❌"
          , "yellow_heart": "💛"
          , "yen": "💴"
          , "yum": "😋"
          , "zap": "⚡"
          , "zero": "0️⃣"
          , "zzz": "💤"
  }; 

