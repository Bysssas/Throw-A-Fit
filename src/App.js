import { useState } from "react";
import { getCategory } from "./api";

function App() {
  const [message, setMessage] = useState("");

  const handleClick = async (category) => {
    const data = await getCategory(category);
    setMessage(data.message);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>👕 ThrowAFit Categories</h1>
      <button onClick={() => handleClick("tops")}>Tops</button>
      <button onClick={() => handleClick("bottoms")}>Bottoms</button>
      <button onClick={() => handleClick("accessories")}>Accessories</button>
      <button onClick={() => handleClick("shoes")}>Shoes</button>

      <h3 style={{ marginTop: "30px" }}>{message}</h3>
    </div>
  );
}

export default App;
