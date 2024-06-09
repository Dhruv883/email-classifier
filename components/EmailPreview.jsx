const EmailPreview = ({
  mail,
  setSelectedMail,
  selectedMailID,
  setShowModal,
}) => {
  if (!mail) return;
  const { from, subject } = mail?.headers;
  const fromName = from.split("<")[0];
  const { id, type, snippet } = mail;

  const typeStyle = {
    Important: "#17C964",
    Promotions: "#f36f2e",
    Social: "#006FEE",
    Marketing: "#F5A524",
    Spam: "#F31260",
    General: "#9353D3",
  };

  const handleClick = () => {
    setSelectedMail(mail);
    setShowModal(true);
  };

  return (
    <div
      onClick={() => handleClick()}
      className={`border border-gray rounded-xl p-5 cursor-pointer hover:bg-gray transition-all space-y-2 relative ${
        selectedMailID === id ? "bg-gray" : "bg-black"
      }`}
    >
      <div className="text-2xl font-semibold">{fromName}</div>
      <div className="w-4/5 font-medium">Sub: {subject}</div>
      <div className="text-textGray text-wrap">
        <pre className="text-wrap break-words whitespace-pre-wrap text-sm tracking-tight">
          {snippet}
        </pre>
      </div>

      {type && (
        <div
          className={`absolute top-2 right-5 px-4 py-1 rounded-lg`}
          style={{ backgroundColor: typeStyle[type] }}
        >
          {type}
        </div>
      )}
    </div>
  );
};

export default EmailPreview;
