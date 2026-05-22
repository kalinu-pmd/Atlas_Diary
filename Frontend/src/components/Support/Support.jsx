import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import { MdReply, MdSupportAgent } from "react-icons/md";
import Footer from "../Footer/Footer";
import { fetchMyContactMessages, replyContactMessage } from "../../api/index.js";

function Support() {
	const user = useSelector((state) => state.auth.authData);
	const isSignedIn = Boolean(user?.token);
	const [supportMessages, setSupportMessages] = useState([]);
	const [supportLoading, setSupportLoading] = useState(false);
	const [supportError, setSupportError] = useState("");
	const [supportView, setSupportView] = useState("active");
	const [selectedSupport, setSelectedSupport] = useState(null);
	const [replyText, setReplyText] = useState("");
	const [replySending, setReplySending] = useState(false);
	const [attachmentData, setAttachmentData] = useState(null);
	const [attachmentName, setAttachmentName] = useState("");
	const [previewSrc, setPreviewSrc] = useState(null);

	useEffect(() => {
		if (!isSignedIn) return;
		let mounted = true;
		setSupportLoading(true);
		setSupportError("");
		fetchMyContactMessages()
			.then(({ data }) => {
				if (!mounted) return;
				const items = Array.isArray(data?.data) ? data.data : [];
				setSupportMessages(items);
				setSelectedSupport(items[0] || null);
			})
			.catch((error) => {
				if (!mounted) return;
				console.error("Failed to load support inbox:", error);
				setSupportError("Failed to load your support inbox.");
			})
			.finally(() => {
				if (mounted) setSupportLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, [isSignedIn]);

	const filteredMessages = supportMessages.filter((message) =>
		supportView === "active" ? !message.isResolved : message.isResolved,
	);

	useEffect(() => {
		if (!filteredMessages.length) {
			setSelectedSupport(null);
			return;
		}
		if (!filteredMessages.some((item) => item._id === selectedSupport?._id)) {
			setSelectedSupport(filteredMessages[0]);
		}
	}, [filteredMessages, selectedSupport?._id]);

	const handleSupportReply = async () => {
		const trimmed = replyText.trim();
		if (!selectedSupport || !trimmed) return;
		setReplySending(true);
		try {
			const { data } = await replyContactMessage(selectedSupport._id, {
				message: trimmed,
				attachment: attachmentData || null,
			});
			const updated = data?.data || data;
			if (updated?._id) {
				setSupportMessages((prev) =>
					prev.map((item) => (item._id === updated._id ? updated : item)),
				);
				setSelectedSupport(updated);
				setReplyText("");
				setAttachmentData(null);
				setAttachmentName("");
			}
		} catch (error) {
			console.error("Failed to send support reply:", error);
		} finally {
			setReplySending(false);
		}
	};

	const handleAttachmentChange = (e) => {
		const file = e.target.files && e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			setAttachmentData(reader.result);
			setAttachmentName(file.name);
		};
		reader.readAsDataURL(file);
	};

	const removeAttachment = () => {
		setAttachmentData(null);
		setAttachmentName("");
	};

	if (!isSignedIn) {
		return <Redirect to="/auth" />;
	}

	const unresolvedCount = supportMessages.filter((message) => !message.isResolved).length;
	const resolvedCount = supportMessages.filter((message) => message.isResolved).length;

	return (
		<div className="min-h-screen bg-off-white flex flex-col">
			<section className="bg-gradient-to-br from-dark-green via-[#0a2d26] to-[#071e18] px-4 py-14 text-center">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-white font-extrabold text-3xl sm:text-4xl mb-3">Support Center</h1>
				</div>
			</section>

			<section className="px-4 py-8">
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
					<div className="flex flex-col gap-4 min-w-0">
						<div className="bg-off-white border border-dark-green/10 rounded-2xl shadow-form p-5 min-w-0">
							<div className="flex items-start justify-between gap-3 mb-4">
								<div className="min-w-0">
									<h2 className="text-text-dark font-extrabold text-lg">Your requests</h2>
									<p className="text-text-gray text-xs break-words">Keep track of active threads and resolved conversations.</p>
								</div>
								<div className="w-10 h-10 rounded-xl bg-light-green/15 flex items-center justify-center text-dark-green shrink-0">
									<MdSupportAgent size={20} />
								</div>
							</div>
							<div className="flex gap-2 mb-4">
								<button
									type="button"
									onClick={() => setSupportView("active")}
									className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
										supportView === "active"
											? "bg-light-green text-dark-green border-light-green"
											: "bg-transparent text-text-gray border-dark-green/20 hover:text-dark-green"
									}`}
								>
									Unresolved ({unresolvedCount})
								</button>
								<button
									type="button"
									onClick={() => setSupportView("resolved")}
									className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
										supportView === "resolved"
											? "bg-light-green text-dark-green border-light-green"
											: "bg-transparent text-text-gray border-dark-green/20 hover:text-dark-green"
									}`}
								>
									Resolved ({resolvedCount})
								</button>
							</div>

							{supportLoading ? (
								<div className="py-10 text-center text-text-gray text-sm">Loading your inbox...</div>
							) : supportError ? (
								<div className="py-10 text-center text-orange text-sm break-words">{supportError}</div>
							) : filteredMessages.length === 0 ? (
								<div className="py-10 text-center text-text-gray text-sm break-words">No messages in this section yet.</div>
							) : (
								<div className="space-y-2 max-h-[58vh] overflow-y-auto pr-1">
									{filteredMessages.map((item) => (
										<button
											key={item._id}
											type="button"
											onClick={() => setSelectedSupport(item)}
											className={`w-full text-left rounded-xl border px-3 py-3 transition-colors min-w-0 ${
												selectedSupport?._id === item._id
													? "border-dark-green bg-light-green/15"
													: "border-dark-green/10 hover:border-dark-green/40"
											}`}
										>
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0 flex-1">
													<p className="text-sm font-bold text-text-dark break-words">{item.subject}</p>
													<p className="text-xs text-text-gray mt-1 truncate">{item.message}</p>
												</div>
												<span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${item.isResolved ? "bg-light-green text-dark-green" : "bg-orange/10 text-orange"}`}>
													{item.isResolved ? "Resolved" : "Unresolved"}
												</span>
											</div>
											<p className="text-[11px] text-text-gray mt-2">{new Date(item.createdAt).toLocaleDateString()}</p>
										</button>
									))}
								</div>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-off-white border border-dark-green/10 rounded-2xl p-5 shadow-card">
								<h3 className="text-dark-green font-bold text-sm mb-2">Need a new request?</h3>
								<p className="text-text-gray text-xs break-words mb-3">Use the contact form to open a fresh support request, report a bug, or send general feedback.</p>
								<Link to="/contact" className="text-accent-green font-semibold text-xs hover:underline no-underline">Open contact form →</Link>
							</div>
							<div className="bg-off-white border border-dark-green/10 rounded-2xl p-5 shadow-card">
								<h3 className="text-dark-green font-bold text-sm mb-2">Status summary</h3>
								<div className="flex flex-wrap gap-2 text-xs">
									<span className="bg-light-green/15 text-dark-green px-2.5 py-1 rounded-full font-semibold">Unresolved {unresolvedCount}</span>
									<span className="bg-light-green/15 text-dark-green px-2.5 py-1 rounded-full font-semibold">Resolved {resolvedCount}</span>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-off-white border border-dark-green/10 rounded-2xl shadow-form p-5 min-w-0">
						<div className="flex items-center justify-between gap-3 mb-4">
							<div className="min-w-0">
								<h2 className="text-text-dark font-extrabold text-lg">Thread details</h2>
								<p className="text-text-gray text-xs break-words">Read the latest reply and add a follow-up if needed.</p>
							</div>
							{selectedSupport && (
								<span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${selectedSupport.isResolved ? "bg-light-green text-dark-green" : "bg-orange/10 text-orange"}`}>
									{selectedSupport.isResolved ? "Resolved" : "Unresolved"}
								</span>
							)}
						</div>

						{selectedSupport ? (
							<div className="space-y-4">
								<div className="rounded-xl border border-dark-green/10 bg-light-green/5 p-4 min-w-0">
									<p className="text-text-dark font-bold text-base break-words">{selectedSupport.subject}</p>
									<p className="text-xs text-text-gray mt-1 break-words">Sent on {new Date(selectedSupport.createdAt).toLocaleString()}</p>
									<p className="text-sm text-text-dark whitespace-pre-wrap break-words mt-3">{selectedSupport.message}</p>
									{selectedSupport.attachment && (
										<div className="mt-3">
											<img src={selectedSupport.attachment} alt="attachment" className="w-full max-h-[60vh] object-contain rounded-md border border-dark-green/10 cursor-pointer" onClick={() => setPreviewSrc(selectedSupport.attachment)} />
										</div>
									)}
								</div>

								<div>
									<p className="text-xs font-semibold uppercase tracking-wide text-dark-green mb-2">Conversation</p>
									<div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
										{Array.isArray(selectedSupport.replies) && selectedSupport.replies.length > 0 ? (
											selectedSupport.replies.map((reply, index) => (
												<div key={`${reply.createdAt || "reply"}-${index}`} className="bg-off-white border border-dark-green/10 rounded-lg p-3 min-w-0">
													<p className="text-[11px] text-text-gray mb-1">{reply.sender === "admin" ? "Support" : "You"} · {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ""}</p>
													<p className="text-sm text-text-dark whitespace-pre-wrap break-words">{reply.message}</p>
													{reply.attachment && (
														<div className="mt-2">
															<img src={reply.attachment} alt="reply-attachment" className="max-w-full max-h-[50vh] object-contain rounded-md border cursor-pointer" onClick={() => setPreviewSrc(reply.attachment)} />
														</div>
													)}
												</div>
											))
										) : (
											<p className="text-xs text-text-gray">No replies yet.</p>
										)}
									</div>
								</div>

								{!selectedSupport.isResolved ? (
									<div className="rounded-xl border border-light-green/30 bg-light-green/5 p-4">
										<label className="text-xs font-semibold text-dark-green">Add a follow-up</label>
										<textarea
											rows={4}
											value={replyText}
											onChange={(e) => setReplyText(e.target.value)}
											placeholder="Add more details or continue the conversation..."
											className="w-full mt-2 rounded-lg border border-dark-green/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 bg-off-white resize-y break-words"
										/>
										<div className="mt-2 flex items-center gap-3">
											<input id="support-attachment" type="file" accept="image/*" onChange={handleAttachmentChange} className="hidden" />
											<label htmlFor="support-attachment" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-off-white border border-dark-green/20 text-sm cursor-pointer hover:bg-light-green/5">Attach photo</label>
											{attachmentData && (
												<div className="flex items-center gap-2">
													<img src={attachmentData} alt={attachmentName} className="max-w-full max-h-[50vh] object-contain rounded-md border" />
													<button type="button" onClick={removeAttachment} className="text-xs text-orange underline ml-1">Remove</button>
												</div>
											)}
										</div>
										<div className="flex justify-end mt-3">
											<button type="button" onClick={handleSupportReply} disabled={replySending || !replyText.trim()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-green text-off-white font-bold text-xs hover:bg-dark-green-hover transition-colors disabled:opacity-50">
												<MdReply size={14} />
												{replySending ? "Sending..." : "Send reply"}
											</button>
										</div>
									</div>
								) : (
									<div className="rounded-xl border border-light-green/30 bg-light-green/5 p-4 text-center">
										<p className="text-sm font-semibold text-dark-green">This ticket is closed.</p>
										<p className="text-xs text-text-gray mt-1">You can view the resolution details above, but replies and attachments are disabled.</p>
									</div>
								)}
							</div>
						) : (
							<div className="py-16 text-center text-text-gray text-sm">Select a request to view the conversation.</div>
						)}
					</div>
				</div>
			</section>

			{previewSrc && (
				<div
					className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/70 p-4"
					onClick={() => setPreviewSrc(null)}
				>
					<div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
						<img src={previewSrc} alt="preview" className="max-w-full max-h-[90vh] rounded-md shadow-lg" />
						<button
							onClick={() => setPreviewSrc(null)}
							className="absolute top-4 right-4 text-white bg-black/40 p-2 rounded-full"
						>
							Close
						</button>
					</div>
				</div>
			)}

			<Footer />
		</div>
	);
}

export default Support;