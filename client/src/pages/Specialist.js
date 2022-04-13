import {
  makeStyles,
  Paper,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import { Row, Col, Container } from "react-grid-system";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  section: { padding: theme.spacing(2) },
  informationRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5em",
  },
}));

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData("1", 159, 6.0, 24, 4.0),
  createData("2", 237, 9.0, 37, 4.3),
  createData("3", 262, 16.0, 24, 6.0),
  createData("4", 305, 3.7, 67, 4.3),
  createData("5", 356, 16.0, 49, 3.9),
];

const Specialist = () => {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <Row>
        <Col md={4}>
          <Paper square>
            <div className={classes.section}>
              <div className={classes.informationRow}>
                <div className={classes.informationTitle}>Your Balance</div>
                <div className={classes.informationTitle}>30000 $ABK</div>
              </div>
              <div className={classes.informationRow}>
                <div className={classes.informationTitle}>Your Approval</div>
                <div className={classes.informationTitle}>3000 $ABK</div>
              </div>
              <div className={classes.informationRow}>
                <div className={classes.informationTitle}>Stakes</div>
                <div className={classes.informationTitle}>4000 $ABK</div>
              </div>
              <div className={classes.informationRow}>
                <div className={classes.informationTitle}>Locked Weight</div>
                <div className={classes.informationTitle}>2500</div>
              </div>
              <div className={classes.informationRow}>
                <div className={classes.informationTitle}>Reputation</div>
                <div className={classes.informationTitle}>1.5478</div>
              </div>
              <div className={classes.informationRow}>
                <div className={classes.informationTitle}>
                  Max Destake Allowed
                </div>
                <div className={classes.informationTitle}>400 $ABK</div>
              </div>
            </div>
            <Divider />
            <div className={classes.section}>
              <Row>
                <Col sm={6}>
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    color="primary"
                  >
                    Stake
                  </Button>
                </Col>
                <Col sm={6}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="primary"
                  >
                    De Stake
                  </Button>
                </Col>
              </Row>
            </div>
          </Paper>
        </Col>
        <Col md={8}>
          <Paper square>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Request ID</TableCell>
                  <TableCell>Token ID</TableCell>
                  <TableCell>Suggestion Price</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell>{row.calories}</TableCell>
                    <TableCell>
                      <TextField
                        label="Your Suggested Price"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" color="secondary" size="small">
                        Submit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Col>
      </Row>
    </Container>
  );
};

export default Specialist;
