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

            {/* <p style="display: flex; z-index: 1; flex-wrap: wrap; align-items: center; justify-content: center; width: 100%; margin: 1.25em auto 0px;">
                <a
                  href="#"
                  class="btn btn-lg btn-link jss397 jss403"
                  style="margin-right: 8px;"
                >
                  Cancel
                </a>
                <a
                  href="#"
                  class="btn btn-lg btn-primary jss397 jss401 "
                  style="margin-right: 8px; border-color: rgb(40, 96, 144); box-shadow: rgba(0, 0, 0, 0.075) 0px 1px 1px inset, rgb(165, 202, 234) 0px 0px 8px;"
                >
                  Yes, delete it!
                </a>
              </p> */}
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
