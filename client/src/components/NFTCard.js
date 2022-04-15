import {
  makeStyles,
  Paper,
  Divider,
  Button,
  Typography,
  IconButton,
} from "@material-ui/core";
import { useState, useEffect } from "react";
import axios from "axios";
import { SpinnerDiamond } from "spinners-react";
import moment from "moment";
import { useTimer } from "react-timer-hook";
import { AddCircle } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(2),
  },
  img: {
    width: "100%",
  },
  section: { padding: theme.spacing(2) },
  priceInfoRequst: {
    display: "flex",
    justifyContent: "space-between",
    //marginBottom: theme.spacing(2),
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
  },
  loadingContainer: {
    width: "100%",
    height: 250,
    display: "flex",
    justifyContent: "center",
  },
}));

const NFTCard = ({
  variant,
  src,
  tokenId,
  fakeApe,
  onRequestForPrice,
  onDropRequest,
  onAcceptRequest,
  request,
  auction,
  onEndEngAuction,
  getCurrentPrice,
  bidEngAuction,
  onIncreaseApproval,
  buyDutchAuction,
}) => {
  const classes = useStyles();

  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    const main = async () => {
      if (getCurrentPrice) {
        setCurrentPrice(await getCurrentPrice());
        setInterval(async () => {
          setCurrentPrice(await getCurrentPrice());
        }, 5 * 1000);
      }
    };
    main();
  }, []);

  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp: auction?.endAt
      ? new Date(parseInt(String(auction.endAt)) * 1000)
      : new Date(),
    onExpire: () => console.warn("onExpire called"),
  });

  const [nftInfo, setNFTInfo] = useState(null);

  const getTokenUrl = (tokenId) =>
    `https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/${String(
      tokenId
    )}`;

  const handleIpfs = (ipfsHash) =>
    ipfsHash.replace("ipfs://", "https://ipfs.io/ipfs/");

  useEffect(() => {
    axios
      .get(getTokenUrl(tokenId))
      .then(function (response) {
        // handle success
        setNFTInfo(response.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const renderProperActions = () => {
    switch (variant) {
      case "dutch":
        return (
          <>
            <div className={classes.section}>
              <div className={classes.actionRow}>
                <Typography variant="body1">
                  Dutch Auction{" "}
                  <IconButton
                    onClick={onIncreaseApproval}
                    size="small"
                    color="primary"
                  >
                    <AddCircle />
                  </IconButton>
                </Typography>
              </div>
            </div>
            <Divider />
            <div className={classes.section}>
              <div className={classes.actionRow}>
                <div className={classes.priceInfo}>
                  <Typography variant="body1" className={classes.priceTitle}>
                    Current Price:
                  </Typography>
                  <Typography variant="body2" className={classes.priceAmount}>
                    {String(currentPrice)} ABK$
                  </Typography>
                </div>
                <Button
                  onClick={buyDutchAuction}
                  size="small"
                  variant="text"
                  color="primary"
                >
                  Buy
                </Button>
              </div>
            </div>
          </>
        );
      case "english":
        return (
          <>
            <div className={classes.section}>
              <div className={classes.actionRow}>
                <Typography variant="body1">
                  English Auction{" "}
                  <IconButton
                    onClick={onIncreaseApproval}
                    size="small"
                    color="primary"
                  >
                    <AddCircle />
                  </IconButton>
                </Typography>
                <Typography variant="body2">
                  {isRunning ? (
                    <>
                      {minutes}:{seconds}
                    </>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={onEndEngAuction}
                      >
                        End
                      </Button>
                    </>
                  )}
                </Typography>
              </div>
            </div>
            <Divider />
            <div className={classes.section}>
              <div className={classes.actionRow}>
                <div className={classes.priceInfo}>
                  <Typography variant="body1" className={classes.priceTitle}>
                    Highest Bid:
                  </Typography>
                  <Typography variant="body2" className={classes.priceAmount}>
                    {auction.status === 0
                      ? String(auction.startingBid)
                      : String(auction.highestBid)}{" "}
                    ABK
                  </Typography>
                </div>
                <Button
                  onClick={bidEngAuction}
                  size="small"
                  variant="text"
                  color="primary"
                >
                  Bid
                </Button>
              </div>
            </div>
          </>
        );
      case "requested":
        return (
          <>
            <div className={classes.section}>
              <div className={classes.priceInfoRequst}>
                <Typography variant="body1" className={classes.priceTitle}>
                  Offered Price:
                </Typography>
                <Typography variant="body2" className={classes.priceAmount}>
                  {String(request.offer)} ABK
                </Typography>
              </div>
            </div>
            <Divider />

            <div className={classes.section}>
              <div className={classes.priceInfoRequst}>
                <Button
                  disabled={
                    parseInt(new Date().getTime()) -
                      parseInt(String(request?.createdAt)) * 1000 <
                    1000 * 60 * 2
                  }
                  color="primary"
                  variant="contained"
                  onClick={onAcceptRequest}
                >
                  Accept
                </Button>
                <Button
                  onClick={onDropRequest}
                  color="secondary"
                  variant="contained"
                >
                  Drop
                </Button>
              </div>
            </div>
          </>
        );
      default:
        return (
          <div className={classes.section}>
            <Button
              onClick={onRequestForPrice}
              size="small"
              fullWidth
              variant="contained"
              color="primary"
            >
              Request For Price
            </Button>
          </div>
        );
    }
  };

  return (
    <Paper className={classes.root}>
      {!nftInfo ? (
        <div className={classes.loadingContainer}>
          <SpinnerDiamond
            size={73}
            thickness={180}
            speed={152}
            color="rgba(77, 119, 255, 1)"
            secondaryColor="rgba(242, 250, 90, 1)"
          />
        </div>
      ) : (
        <>
          <div>
            <img className={classes.img} src={handleIpfs(nftInfo.image)} />
          </div>
          <Divider />
          <div className={classes.section}>Fake Ape #{String(tokenId)}</div>
          <Divider />
        </>
      )}

      {renderProperActions()}
    </Paper>
  );
};

export default NFTCard;
