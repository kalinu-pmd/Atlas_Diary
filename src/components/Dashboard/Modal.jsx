import React from "react";
import "./styles.css"; 

const Modal = ({ isOpen, onClose, onSave, onDelete, children }) => {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal">
				<div className="modal-content">{children}</div>
				<div className="modal-actions">
					<button onClick={onClose}>Cancel</button>
					{onSave && <button onClick={onSave}>Save</button>}
					{onDelete && <button onClick={onDelete}>Delete</button>}
				</div>
			</div>
		</div>
	);
};


export default Modal;
