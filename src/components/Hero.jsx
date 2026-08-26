import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FaSearch } from "react-icons/fa";


function Hero({ search, setSearch }) {
  return (
    <div className="search-box-outer">
      <div className="search-box">
        <InputGroup>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>

          <Form.Control
            type="text"
            placeholder="Search for delicious food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>
    </div>
  );
}


export default Hero;