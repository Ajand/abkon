import {
  makeStyles,
  AppBar,
  Typography,
  Button,
  Toolbar,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import useConnection from "../web3/useConnection";
import withError from "./withError";

const useStyles = makeStyles((theme) => ({
  root: {},
  title: {
    flexGrow: 1,
    color: theme.palette.secondary.main,
  },
  mr: {
    marginRight: theme.spacing(1),
  },
}));

const Header = ({ alertError, connection }) => {
  const classes = useStyles();

  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          ABKON
        </Typography>
        {connection.isConnected ? (
          <>
            <Button
              onClick={() => navigate("/abkoin")}
              className={classes.mr}
              color="secondary"
            >
              Abkoin
            </Button>
            <Button
              onClick={() => navigate("/nfts")}
              className={classes.mr}
              color="secondary"
            >
              NFT Wallet
            </Button>
            <Button
              onClick={() => navigate("/panel")}
              className={classes.mr}
              color="secondary"
            >
              Specialist
            </Button>
            <Button onClick={() => navigate("/")} color="secondary">
              Auctions
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() =>
                connection
                  .connect()
                  .then(() => {
                    console.log("Handle the connection from here");
                  })
                  .catch((err) => {
                    alertError(err.message);
                  })
              }
              color="secondary"
            >
              Connect
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default withError(Header);
