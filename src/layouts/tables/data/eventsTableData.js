const eventsTableData = (eventList) => {
  const columns = [
    { name: "name", align: "left" },
    { name: "location", align: "left" },
    { name: "time", align: "center" },
    { name: "avatar", align: "center" },
  ];

  const rows = eventList.map((event) => ({
    name: event.name,
    location: event.location,
    time: new Date(event.timeStart).toLocaleString() + " - " + new Date(event.timeEnd).toLocaleString(),
    avatar: (
      <img
        src={event.avatar}
        alt={event.name}
        style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" }}
      />
    ),
  }));

  return { columns, rows };
};

export default eventsTableData;
