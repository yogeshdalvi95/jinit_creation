import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Auth, Button, CustomInput, SnackBarComponent } from "..";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import { GridContainer, GridItem } from "../Grid";
import { useState } from "react";
import commonStyles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { hasError, isEmptyString } from "../../Utils";
import { providerForPost } from "../../api";
import { backend_duplicate_designs } from "../../constants";
import { useHistory } from "react-router-dom";
import { EDITDESIGN } from "../../paths";

const useStyles = makeStyles(commonStyles);
export default function DialogBoxForDuplicatingDesign(props) {
  const classes = useStyles();
  const history = useHistory();
  const [openBackDrop, setBackDrop] = useState(false);
  const [designNumber, setDesignNumber] = useState("");
  const [error, setError] = React.useState([]);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const handleAddDuplicateDesign = async () => {
    setBackDrop(true);
    await providerForPost(
      backend_duplicate_designs,
      {
        design: props.designId,
        designNumber: designNumber,
      },
      Auth.getToken()
    )
      .then((res) => {
        setBackDrop(false);
        history.push(`${EDITDESIGN}/${res.data.id}`);
      })
      .catch((err) => {
        setBackDrop(false);
        if (err?.response?.status === 400) {
          setError(["Material with same name already present"]);
        } else {
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error",
          }));
        }
      });
  };

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  return (
    <div>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="select-raw-material-title"
        aria-describedby="select-raw-material-dialog-description"
        maxWidth={"lg"}
      >
        <DialogTitle id="dialog-title">{`Duplicate Design : ${props.designNumber}`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            <>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    onChange={(event) => {
                      setError([]);
                      setDesignNumber(event.target.value);
                    }}
                    labelText="New Design Number"
                    value={designNumber}
                    name="design_number"
                    id="design_number"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_design_number"}
                    isHelperText={error.length}
                    helperText={
                      error.length
                        ? error.map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={error.length}
                  />
                </GridItem>
              </GridContainer>
              <Backdrop className={classes.backdrop} open={openBackDrop}>
                <CircularProgress color="inherit" />
              </Backdrop>
            </>
          </DialogContentText>
        </DialogContent>
        <DialogActions
          style={{
            justifyContent: "center",
          }}
        >
          <Button onClick={props.handleCancel} color="danger">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (isEmptyString(designNumber)) {
                setError(["Design number cannot be empty"]);
              } else {
                handleAddDuplicateDesign();
              }
            }}
            color="success"
          >
            Duplicate
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop className={classes.backdrop} open={openBackDrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
