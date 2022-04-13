import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

const Boilerplate = () => {
  const classes = useStyles();

  return <div>This is the boilerplate component</div>;
};

export default Boilerplate;
