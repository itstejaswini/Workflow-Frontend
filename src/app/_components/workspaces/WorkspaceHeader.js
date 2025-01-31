"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { updateWorkspaceData } from "@/redux/feautres/workspaceSlice";
import Cookies from "js-cookie";
import { Star } from "lucide-react"; // Assuming StarFill represents a filled star icon
import { useRouter } from "next/navigation";
import { deleteWorkspace } from "@/redux/feautres/userDetailsSlice";

const moduleColors = {
  "work-management": "from-purple-600 to-purple-400",
  dev: "from-green-600 to-green-400",
  crm: "from-yellow-600 to-yellow-400",
  service: "from-teal-600 to-teal-400",
  default: "from-gray-600 to-gray-400",
};

export default function WorkspaceHeader({
  module,
  workspaceId,
  workspaceName,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState(workspaceName);
  const [deleteInput, setDeleteInput] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  const bgColor = moduleColors[module] || moduleColors.default;

  useEffect(() => {
    const socket = io("http://localhost:4000/", { transports: ["websocket"] });

    socket.emit(
      "isWorkspaceInFavourite",
      { workspaceId, type: module },
      (response) => {
        if (!response) {
          console.error("Error checking if workspace is in favourite.");
          return;
        }

        setIsFavorite(response.isFavourite);
      }
    );
  }, [workspaceId, module]);

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);

    const socket = io("http://localhost:4000/", { transports: ["websocket"] });

    socket.emit(
      isFavorite ? "removeFavouriteWorkspace" : "addFavouriteWorkspace",
      { workspaceId, type: module },
      (response) => {
        if (!response) {
          console.error("Error toggling favorite workspace.");
          return;
        }

        console.log(response);
      }
    );
  };

  const handleEditWorkspace = () => {
    const socket = io("http://localhost:4000/", { transports: ["websocket"] });

    socket.emit(
      "updateWorkspaceById",
      {
        id: workspaceId,
        updateData: { workspaceName: newWorkspaceName },
      },
      (response) => {
        if (!response) {
          console.error("Error updating workspace.");
          return;
        }

        dispatch(
          updateWorkspaceData({
            field: "workspaceName",
            value: response.workspaceName,
          })
        );
      }
    );

    setIsDialogOpen(false);
  };

  const handleDeleteWorkspace = () => {
    if (deleteInput === `${module}/${workspaceName}`) {
      const socket = io("http://localhost:4000/", {
        transports: ["websocket"],
      });

      socket.emit(
        "deleteWorkspaceById",
        { id: workspaceId, moduleId: Cookies.get("moduleId") },
        (response) => {
          if (!response) {
            console.error("Error deleting workspace.");
            return;
          }

          Cookies.remove("workspaceId");
        }
      );

      dispatch(deleteWorkspace(workspaceId));

      router.push(`/${module}/dashboard`);

      setIsDialogOpen(false);
    } else {
      alert("Invalid input. Please enter the correct combination.");
    }
  };

  return (
    <div
      className={`bg-gradient-to-r ${bgColor} text-white p-6 rounded-lg shadow-lg flex justify-between items-center`}
    >
      <div>
        <h1 className="text-3xl font-bold leading-tight">{workspaceName}</h1>
        <p className="text-sm opacity-80 mt-1 capitalize">
          {module.replace("-", " ")}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleFavorite}
          className="text-yellow-400 hover:text-yellow-500 focus:outline-none"
        >
          {isFavorite ? (
            <Star fill="yellow" size={24} />
          ) : (
            <Star fill="white" size={24} />
          )}
        </button>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="bg-gray-800 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-300"
        >
          <span>Edit Workspace</span>
        </button>
      </div>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Workspace</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4">
            <TextField
              label="Workspace Name"
              value={newWorkspaceName}
              onChange={(event) => setNewWorkspaceName(event.target.value)}
              fullWidth
            />
            <TextField
              label="Delete Confirmation"
              placeholder={`Enter ${module}/${workspaceName}`}
              value={deleteInput}
              onChange={(event) => setDeleteInput(event.target.value)}
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditWorkspace} color="primary">
            Save
          </Button>
          <Button
            onClick={handleDeleteWorkspace}
            color="warning"
            disabled={deleteInput !== `${module}/${workspaceName}`}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
