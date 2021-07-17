import {
  CircularProgress,
  IconButton,
  InputAdornment,
  makeStyles
} from "@material-ui/core";
import * as React from "react";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CustomInput,
  GridContainer,
  GridItem,
  SnackBarComponent
} from "../../components";
import bgImage from "../../assets/img/cover_image.jpg";
import MailIcon from "@material-ui/icons/Mail";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import LockIcon from "@material-ui/icons/Lock";
import { providerForPublicPost } from "../../api";
import { ADMIN, RAWMATERIALSVIEW, STAFF } from "../../paths";
import { useHistory } from "react-router-dom";
import { backend_login } from "../../constants";
import { checkEmpty, hasError, setErrors } from "../../Utils";
import form from "./login.json";
import { dangerColor } from "../../assets/jss/material-dashboard-react";

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
  },
  wrapper: {
    position: "relative"
  },
  buttonProgress: {
    color: "#e91e63",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
};

const useStyles = makeStyles(styles);
const Login = props => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = React.useState(false);
  const [image] = React.useState(bgImage);
  const [showPassword, setShowPassword] = React.useState(false);
  const [values, setValues] = React.useState({});
  const [error, setError] = React.useState({});

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: ""
  });

  const onsubmit = event => {
    event.preventDefault();
    setLoading(true);
    let isValid = false;
    let error = {};
    error = setErrors(values, form);
    if (checkEmpty(error)) {
      isValid = true;
    } else {
      setLoading(false);
      setError(error);
    }
    if (isValid) {
      handSubmit();
    }
  };

  const handSubmit = async () => {
    await providerForPublicPost(backend_login, {
      identifier: values.email,
      password: values.password
    })
      .then(res => {
        if (res.data && res.data.user.role && res.data.user.role.name) {
          Auth.setToken(res.data.jwt, true);
          Auth.setUserInfo(res.data.user, true);
          if (res.data.user.role.name === process.env.REACT_APP_STAFF) {
            history.push(RAWMATERIALSVIEW);
          } else if (res.data.user.role.name === process.env.REACT_APP_ADMIN) {
            history.push(STAFF);
          } else if (
            res.data.user.role.name === process.env.REACT_APP_SUPER_ADMIN
          ) {
            history.push(ADMIN);
          }
        } else {
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Login/Password Invalid"
          }));
        }
        setLoading(false);
      })
      .catch(err => {
        setSnackBar(snackBar => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Login/Password Invalid"
        }));
        setLoading(false);
      });
  };

  const snackBarHandleClose = () => {
    setSnackBar(snackBar => ({
      ...snackBar,
      show: false,
      severity: "",
      message: ""
    }));
  };

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
          <SnackBarComponent
            open={snackBar.show}
            severity={snackBar.severity}
            message={snackBar.message}
            handleClose={snackBarHandleClose}
          />
          <Card className={classes.header}>
            <form className={classes.form} onSubmit={onsubmit} noValidate>
              <CardHeader color="rose" className={classes.customLogin}>
                <h3 className={classes.cardTitleWhite}>
                  <LockIcon />
                </h3>
                <h3 className={classes.cardTitleWhite}>
                  <span>Log in</span>
                </h3>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText="Email"
                      id="email-address"
                      value={values.email ? values.email : ""}
                      onChange={event => {
                        setValues(values => ({
                          ...values,
                          email: event.target.value
                        }));
                        if (error.hasOwnProperty("email")) {
                          delete error["email"];
                        }
                      }}
                      helperTextId={"helperText-email-id"}
                      isHelperText={hasError("email", error)}
                      helperText={
                        hasError("email", error)
                          ? error["email"].map(error => {
                              return error + " ";
                            })
                          : null
                      }
                      error={hasError("email", error)}
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <MailIcon
                              color={
                                hasError("email", error) ? "error" : "action"
                              }
                            />
                          </InputAdornment>
                        )
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText="Password"
                      id="password"
                      autoComplete="on"
                      value={values.password ? values.password : ""}
                      onChange={event => {
                        setValues(values => ({
                          ...values,
                          password: event.target.value
                        }));
                        if (error.hasOwnProperty("password")) {
                          delete error["password"];
                        }
                      }}
                      helperTextId={"helperText-password-id"}
                      isHelperText={hasError("password", error)}
                      helperText={
                        hasError("password", error)
                          ? error["password"].map(error => {
                              return error + " ";
                            })
                          : null
                      }
                      error={hasError("password", error)}
                      type={showPassword ? "text" : "password"}
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => {
                                setShowPassword(!showPassword);
                              }}
                              onMouseDown={event => {
                                event.preventDefault();
                              }}
                              edge="end"
                            >
                              {showPassword ? (
                                <Visibility
                                  color={
                                    hasError("password", error)
                                      ? "error"
                                      : "action"
                                  }
                                />
                              ) : (
                                <VisibilityOff
                                  color={
                                    hasError("password", error)
                                      ? "error"
                                      : "action"
                                  }
                                />
                              )}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </GridItem>
                </GridContainer>
              </CardBody>
              <CardFooter
                className={classes.alignLoginCard}
                style={{
                  justifyContent: "space-evenly"
                }}
              >
                <div className={classes.wrapper}>
                  <Button
                    color="rose"
                    borderLess
                    type="submit"
                    disabled={loading}
                  >
                    Login
                  </Button>
                  {loading && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </div>
              </CardFooter>
            </form>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
};
export default Login;
