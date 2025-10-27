import Navbar from "./Navbar";
import BookmakerNavbar from "./BookmakerNavbar";
import SisNavbar from "./SisNavbar";
import AdminNavbar from "./AdminNavbar";


function RoleBasedNavbar({ user }) {
    if (!user) {
    return <Navbar />;
  }

  switch (user.role) {
    case "bookmaker":
      return <BookmakerNavbar />;
    case "sis":
      return <SisNavbar />;
    case "admin":
      return <AdminNavbar />;
    default:
      return <Navbar />;
  }
}

export default RoleBasedNavbar;
