const SelectedMail = ({ selectedMail }) => {
  if (!selectedMail) return;
  console.log(selectedMail);
  const { from, subject, date } = selectedMail?.headers;
  const fromName = from?.split("<")[0];
  const fromEmail = from?.split("<")[1].slice(0, -1);
  const { id, type, msg } = selectedMail;
  const newDate = new Date(date);
  const mainDate = newDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="border border-gray rounded-md">
      <div className="w-full p-4 border-b border-gray space-y-2">
        <div className="flex justify-between">
          <span className="text-2xl font-semibold">{fromName}</span>
          <span className="text-textGray text-lg">{mainDate}</span>
        </div>
        <div className="text-sm text-textGray">From: {fromEmail}</div>
        <div className="font-medium">Sub: {subject}</div>
        {type && (
          <div className="border px-4 py-1 rounded-lg w-max">{type}</div>
        )}
      </div>
      <div className="p-4 text-wrap w-full">
        <pre className="text-wrap break-words whitespace-pre-wrap">{msg}</pre>
      </div>
    </div>
  );
};

export default SelectedMail;
