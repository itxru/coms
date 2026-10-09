import { Link } from "react-router-dom";

export default function ForbiddenPage() {
    return (
        <main>
            <h1>403 - Access Denied</h1>
            <p>You do not have permission to access this page.</p>
            <Link to="/dashboard">Return to Dashboard</Link>
        </main>
    );
}
