import { useEffect, useState, useMemo } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import {
  CalendarClock,
  CheckCircle2,
  Trash2,
  Mail,
  User,
  Clock,
  CalendarDays,
  Info,
} from 'lucide-react';

const ManageConsultationsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // future-proof

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/consultations/consultation-request/pending');
      setRequests(res.data || []);
    } catch {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id) => {
    try {
      await axios.patch(`/consultations/consultation-request/${id}/approve`);
      toast.success('Approved!');
      fetchPendingRequests();
    } catch {
      toast.error('Failed to approve');
    }
  };

  const deleteRequest = async (id) => {
    try {
      await axios.delete(`/consultations/consultation-request/${id}`);
      toast.success('Request deleted');
      fetchPendingRequests();
    } catch {
      toast.error('Failed to delete request');
    }
  };

  // nice empty-state copy
  const emptyCopy = useMemo(
    () => ({
      pending: {
        title: 'No pending consultations',
        hint: 'New requests that need approval will appear here.',
      },
    }),
    []
  );

  return (
    <div className="min-h-screen w-full bg-[#F6F7FF] py-8 px-4 md:px-8">
      {/* Header card */}
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_10px_30px_-12px_rgba(76,29,149,0.15)]">
          {/* light gradient glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-400/10 to-transparent blur-3xl" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg">
                <CalendarClock className="h-7 w-7" />
                <span className="absolute -right-1 -top-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 ring-4 ring-white" />
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                    <CalendarDays className="h-3.5 w-3.5" />
                  </span>
                  Dashboard
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-violet-700">
                  Consultations Hub
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Review requests, approve and auto-create events — all in one place.
                </p>
              </div>
            </div>
          </div>

          {/* Pills / tabs row */}
          <div className="mt-6 flex flex-wrap gap-3">
            
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto mt-8 max-w-6xl">
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_28px_-10px_rgba(76,29,149,0.12)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-violet-700">Pending Consultation Requests</h2>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-violet-100 bg-violet-50/50 p-5"
                >
                  <div className="mb-3 h-4 w-2/5 rounded bg-violet-200/60" />
                  <div className="mb-2 h-3 w-3/5 rounded bg-violet-200/60" />
                  <div className="mb-2 h-3 w-1/3 rounded bg-violet-200/60" />
                  <div className="h-8 w-40 rounded-full bg-violet-200/60" />
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-10 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-inner">
                <Info className="h-8 w-8 text-violet-500" />
              </div>
              <p className="text-lg font-semibold text-violet-700">{emptyCopy.pending.title}</p>
              <p className="mt-1 max-w-md text-sm text-slate-500">{emptyCopy.pending.hint}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {requests.map((r) => {
                const date = r?.date ? new Date(r.date) : null;
                const dateStr = date ? date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '—';

                const initials =
                  (r?.name || '').trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') || 'U';

                return (
                  <li
                    key={r._id}
                    className="group rounded-2xl border border-violet-100 bg-gradient-to-b from-white to-violet-50/40 p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Left: identity + meta */}
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow">
                          <span className="text-sm font-bold">{initials}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-slate-800">
                              {r.name || 'Consultation'}
                            </h3>
                            <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white px-2.5 py-0.5 text-xs font-medium text-violet-700">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {dateStr}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white px-2.5 py-0.5 text-xs font-medium text-violet-700">
                              <Clock className="h-3.5 w-3.5" />
                              {r.startTime || '—'}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            {r.email && (
                              <span className="inline-flex items-center gap-1.5">
                                <Mail className="h-4 w-4 text-violet-500" />
                                {r.email}
                              </span>
                            )}
                            {r.userName && (
                              <span className="inline-flex items-center gap-1.5">
                                <User className="h-4 w-4 text-violet-500" />
                                {r.userName}
                              </span>
                            )}
                          </div>

                          {r.description && (
                            <p className="mt-3 line-clamp-2 max-w-3xl text-sm text-slate-500">
                              {r.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveRequest(r._id)}
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-violet-200"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve & Create Event
                        </button>
                        <button
                          onClick={() => deleteRequest(r._id)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageConsultationsTab;
