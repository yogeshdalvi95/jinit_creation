import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Button } from "..";
import styles from "./Dialog.module.css";

export default function DialogBox(props) {
  return (
    <div>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle id="dialog-title">{props.dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            {props.isWarning ? (
              <div className={styles.AlertImageDiv}>
                <span className={styles.alertImageCircle}></span>
                <span className={styles.alertImageIcon}></span>
              </div>
            ) : null}

            <h2 className={styles.highLighter}>Are you sure?</h2>
            {props.text.map(t => (
              <div className={styles.secondText}>{t}</div>
            ))}
            {props.children}
          </DialogContentText>
        </DialogContent>
        <DialogActions
          style={{
            justifyContent: "center"
          }}
        >
          <Button onClick={props.handleCancel} color="danger">
            {props.cancelButton}
          </Button>
          <Button onClick={props.handleAccept} color="success" autoFocus>
            {props.acceptButton}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
