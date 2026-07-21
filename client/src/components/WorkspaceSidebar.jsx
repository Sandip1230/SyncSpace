import Sidebar from "./Sidebar";
import FileExplorer from "./FileExplorer";
import "./WorkspaceSidebar.css";

function WorkspaceSidebar({ roomId, users, connected, fileSystem }) {
  return (
    <div className="workspace-sidebar">
      <div className="workspace-sidebar__pane workspace-sidebar__pane--room">
        <Sidebar roomId={roomId} users={users} connected={connected} />
      </div>
      <div className="workspace-sidebar__pane workspace-sidebar__pane--explorer">
        <FileExplorer fileSystem={fileSystem} />
      </div>
    </div>
  );
}

export default WorkspaceSidebar;