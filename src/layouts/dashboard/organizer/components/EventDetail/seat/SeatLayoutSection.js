import React from "react";
import PropTypes from "prop-types";
import SeatEditor from "./SeatEditor";
import ZoneSeatViewer from "./ZoneSeatViewer";

const SeatLayoutSection = ({ isEditing, formData, setFormData }) => {
  const currentZone = formData.zones?.[0];


  // Convert layout thành seatLayouts format
  const seatLayoutsFromZones = currentZone
    ? [{ zoneId: currentZone._id, layout: currentZone.layout }]
    : [];

  // Khi thay đổi ghế, cập nhật lại vào formData.zones[0].layout
  const handleSeatLayoutChange = (newSeatLayouts) => {
    const updatedZones = [...formData.zones];
    if (updatedZones[0]) {
      updatedZones[0].layout = newSeatLayouts[0].layout;
    }


    setFormData((prev) => {
      const updatedZones = [...(prev.zones || [])];
      if (updatedZones[0]) {
        updatedZones[0].layout = newSeatLayouts[0].layout;
      } else {
        updatedZones.push({
          name: "Sơ đồ ghế",
          layout: newSeatLayouts[0].layout,
        });
      }

      const nextFormData = { ...prev, zones: updatedZones };

      return nextFormData;
    });
  };

  return isEditing ? (
    <SeatEditor
      seatLayouts={seatLayoutsFromZones}
      isEditing
      onChange={handleSeatLayoutChange}
    />
  ) : (
    <ZoneSeatViewer layout={currentZone?.layout} />
  );
};

SeatLayoutSection.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default SeatLayoutSection;
