import React, { useEffect } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Button } from "..";
import { Divider } from "@material-ui/core";
import { GridContainer, GridItem } from "../Grid";
import { useState } from "react";
import { MonthYearPicker } from "../DatePicker";
import { CustomDropDown } from "../CustomDropDown";

export default function DialogForDownloadingDailyUsageData(props) {
  const [selectedOptions, setSelectedOptions] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    downloadBy: "department",
  });

  useEffect(() => {
    setSelectedOptions({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      downloadBy: "department",
    });
  }, [props]);

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={() => {
          props.handleClose();
        }}
        aria-labelledby="select-raw-material-title"
        aria-describedby="select-raw-material-dialog-description"
        maxWidth={"lg"}
      >
        <DialogTitle id="dialog-title">Download daily usage data</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            <>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <MonthYearPicker
                    views={["year", "month"]}
                    onChange={(event) => {
                      console.log("event => ", event);
                      let date = new Date(event);
                      let year = date.getFullYear();
                      let month = date.getMonth();
                      setSelectedOptions((selectedOptions) => ({
                        ...selectedOptions,
                        month: month + 1,
                        year: year,
                      }));
                    }}
                    label="Month/Year"
                    name="date"
                    value={
                      selectedOptions.year && selectedOptions.month
                        ? new Date(
                            selectedOptions.year,
                            selectedOptions.month - 1,
                            1
                          )
                        : null
                    }
                    id="date"
                    openTo="month"
                    style={{
                      marginTop: "-0.4rem",
                      width: "100%",
                    }}
                  />
                </GridItem>
                <Divider />
                <GridItem xs={12} sm={12} md={12}>
                  <CustomDropDown
                    id="download_by"
                    onChange={(event) => {
                      setSelectedOptions((selectedOptions) => ({
                        ...selectedOptions,
                        downloadBy: event.target.value,
                      }));
                    }}
                    labelText="Download By"
                    name="download_by"
                    value={selectedOptions.downloadBy}
                    nameValue={[
                      { name: "Department", value: "department" },
                      { name: "Category", value: "category" },
                    ]}
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
              </GridContainer>
            </>
          </DialogContentText>
        </DialogContent>
        <DialogActions
          style={{
            justifyContent: "center",
          }}
        >
          <Button
            onClick={() => {
              props.handleSelectOpenForDownloadingPDF(selectedOptions);
            }}
            color="success"
          >
            Download PDF
          </Button>
          <Button
            onClick={() => {
              props.handleSelectOpenForDownloadingExcel(selectedOptions);
            }}
            color="success"
          >
            Download Excel
          </Button>
          <Button
            onClick={() => {
              props.handleCancel();
            }}
            color="danger"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
