import { makeStyles } from "@material-ui/core";
import * as React from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CustomInput,
  GridContainer,
  GridItem
} from "../../components";
import bgImage from "../../assets/img/cover_image.jpg";

const styles = {
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    textAlignLast: "center"
  },
  customLogin: {
    height: "4rem"
  },
  alignLoginCard: {
    margin: "auto",
    zIndex: "4",
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: "15px",
    paddingRight: "15px"
  },
  header: {
    marginTop: "9rem"
  },
  background: {
    position: "absolute",
    zIndex: "1",
    height: "100%",
    width: "100%",
    display: "block",
    top: "0",
    left: "0",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    "&:after": {
      position: "absolute",
      zIndex: "2",
      width: "100%",
      height: "100%",
      content: '""',
      display: "block",
      background: "#333232",
      opacity: ".58"
    }
  }
};

const useStyles = makeStyles(styles);
const Login = props => {
  const classes = useStyles();
  const [image] = React.useState(bgImage);
  return (
    <div>
      {image !== undefined ? (
        <div
          className={classes.background}
          style={{ backgroundImage: "url(" + image + ")" }}
        />
      ) : null}
      <GridContainer noWidth>
        <GridItem xs={12} sm={6} md={3} className={classes.alignLoginCard}>
          <Card className={classes.header}>
            <CardHeader color="rose" className={classes.customLogin}>
              <h3 className={classes.cardTitleWhite}>Log in</h3>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Email..."
                    id="email-address"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Password"
                    id="password"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
            </CardBody>
            <CardFooter className={classes.alignLoginCard}>
              <Button color="rose" borderLess>
                Let's go
              </Button>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
};
export default Login;
