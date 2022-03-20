import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
// @material-ui/core components
import { GridContainer, GridItem, CollapsableTable } from "../../components";
// core components
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { isEmptyString } from "../../Utils";
import { CustomTabs } from "../CustomTabs";

export default function DialogForCheckingStockAvailibility(props) {
  let columns = [
    { title: "Name", field: "name" },
    { title: "Current Balance", field: "currentBalance" },
    {
      title: "Quantity required per piece of design",
      field: "quantityRequiredPerPieceOfDesign",
    },
    {
      title: "Total Raw Material required for order completion",
      field: "totalMaterialsRequiredForRemainingQuantity",
    },
  ];

  const StockTable = (props) => {
    return (
      <CollapsableTable
        title={props.title}
        columns={props.columns}
        data={props.data}
      />
    );
  };

  const generateTabs = () => {
    let stock = props?.availibleStocks;
    let output = [];
    if (stock) {
      output.push({
        tabName: stock.isColorPresent
          ? "Common Raw Materials required in all the colors"
          : "All Raw Materials",
        tabContent: (
          <StockTable
            title={
              stock.isColorPresent
                ? "Common Raw Materials required in all the colors"
                : "All Raw Materials"
            }
            columns={columns}
            data={stock.rawMaterials}
          />
        ),
      });
      if (stock.isColorPresent && Object.keys(stock.orderRatios).length) {
        let orderRatio = stock.orderRatios;
        Object.keys(orderRatio).forEach((oR) => {
          output.push({
            tabName: orderRatio[oR].name,
            tabContent: (
              <StockTable
                title={orderRatio[oR].name}
                columns={columns}
                data={orderRatio[oR].rawMaterials}
              />
            ),
          });
        });
      }
    } else {
      return output;
    }
    console.log("output ", output);
    return output;
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
                  title="Available Stocks :"
                  headerColor="primary"
                  tabs={generateTabs()}
                />
                {/* <Box sx={{ width: "100%" }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    textColor="secondary"
                    indicatorColor="secondary"
                    aria-label="secondary tabs example"
                  >
                    {props.availibleStocks?.isColorPresent ? (
                      <>
                        <Tab
                          value="one"
                          label="Common raw materials required in all the colors"
                        />
                        {Object.keys(props.availibleStocks.orderRatios).map(
                          (k, i) => {
                            console.log(
                              "Herere ",
                              props.availibleStocks.orderRatios[k].name,
                              k
                            );
                            return (
                              <>
                                <Tab
                                  value={k}
                                  label={
                                    props.availibleStocks.orderRatios[k]?.name
                                  }
                                />
                              </>
                            );
                          }
                        )}
                      </>
                    ) : (
                      <Tab value="one" label="All Raw Materials" />
                    )}
                  </Tabs>
                </Box> */}
              </GridItem>
            </GridContainer>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}
