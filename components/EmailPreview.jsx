const EmailPreview = ({ mail }) => {
  return (
    <div>
      <div className="border border-white my-5 mx-5 p-5">
        <pre className="overflow-hidden overflow-ellipsis font-notoSans">
          {mail.snippet}
        </pre>
      </div>
      <div>{mail.type}</div>
    </div>
  );
};

export default EmailPreview;
