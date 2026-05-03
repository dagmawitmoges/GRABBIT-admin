import { adminUi } from "../constants/adminUi";

const Header = () => (
  <div className="mb-6">
    <h1 className={adminUi.h1}>Admin Dashboard</h1>
    <p className={adminUi.subtitle}>
      Overview of vendors and recent activity
    </p>
  </div>
);

export default Header;
