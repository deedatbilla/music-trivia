
import ClipLoader from "react-spinners/ClipLoader";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function Loader() {
  return (
    <ClipLoader color={"blue"} loading={true} cssOverride={override} size={120} />
  )
}

export default Loader