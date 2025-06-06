const eventsTableData = (eventList) => {
  const columns = [
    { name: "name", align: "left", width: "25%" },
    { name: "location", align: "left", width: "25%" },
    { name: "time", align: "center", width: "30%" },
    { name: "avatar", align: "center", width: "20%" },
  ];

  const rows = eventList.map((event) => ({
    name: (
      <div style={{ maxWidth: "200px", whiteSpace: "normal", wordWrap: "break-word" }}>
        {event.name}
      </div>
    ),
    location: (
      <div style={{ maxWidth: "200px", whiteSpace: "normal", wordWrap: "break-word" }}>
        {event.location}
      </div>
    ),
    time: new Date(event.timeStart).toLocaleString() + " - " + new Date(event.timeEnd).toLocaleString(),
    avatar: (
      <img
        src={event.avatar}
        alt={event.name}
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "8px",
          objectFit: "cover",
        }}
      />
    ),
  }));

  return { columns, rows };
};

export default eventsTableData;
