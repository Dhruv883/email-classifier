const EmailPreview = ({
  mail,
  setSelectedMail,
  selectedMailID,
  setShowModal,
}) => {
  const { from, subject } = mail.headers;
  const fromName = from.split("<")[0];
  const { id, type, snippet } = mail;

  const handleClick = () => {
    setSelectedMail(mail);
    setShowModal(true);
  };

  return (
    <div
      onClick={() => handleClick()}
      className={`border border-gray rounded-md p-4 cursor-pointer hover:bg-gray transition-all space-y-2 relative ${
        selectedMailID === id ? "bg-gray" : "bg-black"
      }`}
    >
      <div className="text-2xl font-semibold">{fromName}</div>
      <div className="w-4/5 font-medium">Sub: {subject}</div>
      <div className="text-textGray text-wrap">
        <pre className="text-wrap break-words whitespace-pre-wrap">
          {snippet}
        </pre>
      </div>

      {type && (
        <div className="absolute top-2 right-5 border px-4 py-1 rounded-2xl">
          {type}
        </div>
      )}
    </div>
  );
};

export default EmailPreview;
