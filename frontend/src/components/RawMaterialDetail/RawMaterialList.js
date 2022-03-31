import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { convertNumber, validateNumber } from "../../Utils";

const RawMaterialList = ({ data, handleSelectRawMaterial }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Action</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Color</TableCell>
            <TableCell>Size</TableCell>
            <TableCell align="right">Costing</TableCell>
            <TableCell align="right">Stock</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell>
                <button onClick={() => handleSelectRawMaterial(row)}>
                  Select
                </button>
              </TableCell>
              <TableCell component="th" scope="row">
                {row?.name ? row.name : "----"}
              </TableCell>
              <TableCell>
                {row?.category?.name ? row.category.name : "-----"}
              </TableCell>
              <TableCell>
                {row?.department?.name ? row.department.name : "-----"}
              </TableCell>
              <TableCell>
                {row?.color?.name ? row.color.name : "-----"}
              </TableCell>
              <TableCell>{row?.size ? row.size : "----"}</TableCell>
              <TableCell align="right">
                {convertNumber(
                  validateNumber(row.costing),
                  true,
                  true,
                  row?.unit?.name ? " /" + row.unit.name : ""
                )}
              </TableCell>
              <TableCell align="right">
                {row?.balance ? row.balance : 0}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RawMaterialList;
