import React, { useState } from "react";
import axios from "axios";

function AmenityUpload() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("image", image);

    await axios.post("/amenities", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("Amenity uploaded!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Amenity Title"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        required
      />
      <button type="submit">Upload Amenity</button>
    </form>
  );
}

export default AmenityUpload;
