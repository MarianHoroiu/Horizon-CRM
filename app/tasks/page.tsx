import prisma from "@/lib/prisma";
import Link from "next/link";

async function getTasks() {
  const tasks = await prisma.task.findMany({
    include: {
      assignedTo: true,
      contact: true,
    },
  });
  return tasks;
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Link
          href="/"
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg">
          Back to Home
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Title
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Description
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Due Date
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Assigned To
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Contact
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tasks.map(task => (
              <tr key={task.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {task.title}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {task.description}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      task.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : task.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : task.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                    {task.status.replace("_", " ")}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {task.assignedTo.firstName} {task.assignedTo.lastName}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {task.contact.firstName} {task.contact.lastName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
