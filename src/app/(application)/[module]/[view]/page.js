import Dashboard from "@/app/_components/dashboard/Dashboard";
import FavoriteWorkspacesAndBoards from "@/app/_components/favorites/Favorites";
import Welcome from "@/app/_components/UI/Welcome";

export default async function ViewPage({ params }) {
  const { module, view } = await params;

  return (
    <>
      <Welcome view={view} module={module} />
      {view === "dashboard" ? (
        <div className="p-3 space-y-8">
          <Dashboard module={module} />
        </div>
      ) : view === "favorites" ? (
        <div className="mt-8">
          <FavoriteWorkspacesAndBoards module={module} />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
