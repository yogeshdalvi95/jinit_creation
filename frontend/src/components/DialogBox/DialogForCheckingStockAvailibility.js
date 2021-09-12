import React from "react";
// @material-ui/core components
import { GridContainer, GridItem, CollapsableTable } from "../../components";
// core components
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@material-ui/core";
import { isEmptyString } from "../../Utils";
import { CustomTabs } from "../CustomTabs";

export default function DialogForCheckingStockAvailibility(props) {
  let columns = [
    { title: "Name", field: "name" },
    { title: "Current Balance", field: "raw_material_balance" },
    {
      title: "Pending ready material for order completion",
      field: "total_remaining_ready_material"
    },
    {
      title: "Quantity required for 1 ready material",
      field: "quantity_per_ready_material"
    },
    {
      title: "Total Quantity required for order",
      field: "total_required_quantity_for_order"
    },
    {
      title: "Total raw material required / will remain after order completion",
      field: "total_remaining_raw_material"
    }
  ];

  const StockTable = props => {
    return (
      <CollapsableTable
        title={props.title}
        columns={props.columns}
        data={props.data}
      />
    );
  };

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="select-raw-material-title"
        aria-describedby="select-raw-material-dialog-description"
        maxWidth={"lg"}
      >
        <DialogTitle id="dialog-title">Stock Availibility</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <CustomTabs
                  title="Available Stocks :-"
                  headerColor="primary"
                  tabs={
                    Object.keys(props.availibleStocks).length
                      ? Object.keys(props.availibleStocks).map(r => {
                          if (r === "raw_material_without_color") {
                            return {
                              tabName: "Color Independent Stocks",
                              tabContent: (
                                <StockTable
                                  title="Color Independent Stocks"
                                  columns={columns}
                                  data={
                                    props.availibleStocks &&
                                    props.availibleStocks
                                      .raw_material_without_color
                                      ? props.availibleStocks
                                          .raw_material_without_color
                                      : []
                                  }
                                />
                              )
                            };
                          } else {
                            return {
                              tabName: r,
                              tabContent: (
                                <StockTable
                                  title={r}
                                  columns={columns}
                                  data={props.availibleStocks[r]}
                                />
                              )
                            };
                          }
                        })
                      : []
                  }
                />
              </GridItem>
            </GridContainer>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}
