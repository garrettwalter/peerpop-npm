"use strict";

var React = require("react");

function slugFromUrl(url) {
  if (typeof url !== "string") return "event";
  try {
    return "event-" + btoa(url).replace(/[/+=]/g, "").slice(0, 24);
  } catch (e) {
    return "event-" + url.replace(/\W/g, "-").slice(0, 24);
  }
}

var defaultStyles = "\n  .peerpop-event-button { background-color: #000; color: #fff; padding: 10px 20px; border-radius: 5px; border: none; cursor: pointer; }\n  .peerpop-modal-overlay { position: fixed; inset: 0; background: rgb(37, 37, 37); display: flex; align-items: center; justify-content: center; z-index: 9999; }\n  .peerpop-modal-content { border-radius: 8px; width: 85vw; height: 85vh; max-width: 85vw; max-height: 85vh; overflow: hidden; display: flex; flex-direction: column; position: relative; }\n  .peerpop-modal-content iframe { border: none; width: 100%; height: 100%; min-height: 0; }\n  @media (max-width: 768px) { .peerpop-modal-content { width: 100vw; height: 100vh; max-width: none; max-height: none; border-radius: 0; } .peerpop-modal-content iframe { min-height: 100%; } }\n  .peerpop-modal-close { position: absolute; top: 12px; right: 12px; min-width: 48px; min-height: 48px; padding: 0; display: flex; align-items: center; justify-content: center; background: transparent; border: none; font-size: 28px; cursor: pointer; line-height: 1; color: #fff; z-index: 10000; -webkit-tap-highlight-color: transparent; }\n  .peerpop-modal-close:hover { color: #ccc; }\n";

function EventDisplayButton(props) {
  var url = props.url;
  var buttonStyles = props.buttonStyles;
  var buttonText = props.buttonText == null ? "Get Tickets" : props.buttonText;
  var modalStyles = props.modalStyles;

  var _React$useState = React.useState(false),
    isOpen = _React$useState[0],
    setIsOpen = _React$useState[1];

  var id = slugFromUrl(url);
  var modalId = "peerpop-modal-" + id;
  var iframeId = "peerpop-iframe-" + id;

  var openModal = function () {
    setIsOpen(true);
  };
  var closeModal = function () {
    setIsOpen(false);
  };

  var modalContentClass =
    "peerpop-modal-content" + (modalStyles ? " " + modalStyles : "");
  var buttonClass =
    "peerpop-event-button" + (buttonStyles ? " " + buttonStyles : "");

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("style", null, defaultStyles),
    React.createElement(
      "button",
      {
        type: "button",
        className: buttonClass,
        onClick: openModal,
        "data-peerpop-event-button": id,
      },
      buttonText
    ),
    isOpen &&
      React.createElement(
        "div",
        {
          id: modalId,
          className: "peerpop-modal-overlay",
          "aria-modal": "true",
          "aria-labelledby": iframeId,
          role: "dialog",
          onClick: function (e) {
            if (e.target.getAttribute("class") === "peerpop-modal-overlay") {
              closeModal();
            }
          },
        },
        React.createElement("button", {
          type: "button",
          className: "peerpop-modal-close",
          "aria-label": "Close",
          onClick: closeModal,
        }, "\u00D7"),
        React.createElement(
          "div",
          {
            className: modalContentClass,
            onClick: function (e) {
              e.stopPropagation();
            },
          },
          React.createElement("iframe", {
            id: iframeId,
            title: "Event",
            src: url,
          })
        )
      )
  );
}

module.exports = EventDisplayButton;
