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

var defaultStyles = "\n  .peerpop-event-button { background-color: #000; color: #fff; padding: 10px 20px; border-radius: 5px; border: none; cursor: pointer; }\n  .peerpop-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }\n  @media (max-width: 768px) { .peerpop-modal-overlay { align-items: flex-end; } }\n  .peerpop-modal-wrapper { position: relative; width: 85vw; height: 85vh; max-width: 85vw; max-height: 85vh; border-radius: 8px; overflow: hidden; }\n  @media (max-width: 768px) { .peerpop-modal-wrapper { width: 100vw; height: 90vh; max-width: none; max-height: none; border-radius: 12px 12px 0 0; } }\n  .peerpop-modal-content { position: absolute; inset: 0; overflow: hidden; z-index: 0; }\n  .peerpop-modal-content iframe { border: none; width: 100%; height: 100%; min-height: 0; }\n  .peerpop-modal-close-wrap { position: fixed; top: 12px; right: 12px; z-index: 9999999; display: flex; align-items: center; justify-content: center; min-width: 56px; min-height: 56px; pointer-events: auto; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }\n  @media (max-width: 768px) { .peerpop-modal-close-wrap { top: 2vh; right: 12px; min-width: 72px; min-height: 72px; width: 72px; height: 72px; } }\n  .peerpop-modal-close { background: transparent; border: none; padding: 0; font-size: 32px; cursor: pointer; line-height: 1; color: #fff; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }\n  @media (max-width: 768px) { .peerpop-modal-close { font-size: 40px; } }\n  .peerpop-modal-close:hover { color: #e0e0e0; }\n";

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
        React.createElement(
          "div",
          {
            className: "peerpop-modal-close-wrap",
            onClick: function (e) {
              e.stopPropagation();
              closeModal();
            },
            onPointerDown: function (e) {
              e.preventDefault();
              e.stopPropagation();
              closeModal();
            },
            role: "button",
            "aria-label": "Close",
            tabIndex: 0,
            onKeyDown: function (e) {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                closeModal();
              }
            },
          },
          React.createElement("span", { className: "peerpop-modal-close" }, "\u00D7")
        ),
        React.createElement(
          "div",
          { className: "peerpop-modal-wrapper" },
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
      )
  );
}

module.exports = EventDisplayButton;
