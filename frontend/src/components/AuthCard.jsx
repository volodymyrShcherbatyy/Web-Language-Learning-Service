const AuthCard = ({ title, children }) => (
  <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
    <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">{title}</h1>
    {children}
  </div>
);

export default AuthCard;
