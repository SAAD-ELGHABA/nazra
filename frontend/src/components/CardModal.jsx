import React from "react";

function CardModal({ isOpen, onClose, children }) {
  return (
    <>
      <div
        className={` overlay ${isOpen ? "overlay-show" : ""}`}
        onClick={onClose}
      ></div>

      <div className={`modal ${isOpen ? "modal-slide-in" : "modal-slide-out"}`}>
        <div className="modal-header">
          <h2>Your Card</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </>
  );
}

export default CardModal;
