'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
	const pathname = usePathname();

	const isActive = (path) => {
		return pathname === path ? 'bg-emerald-700' : '';
	};

	return (
		<nav className="bg-emerald-600 text-white p-4">
			<div className="max-w-6xl mx-auto flex flex-wrap gap-4">
				<Link href="/" className={`px-4 py-2 rounded-lg hover:bg-emerald-700 ${isActive('/')}`}>
					Home
				</Link>
				<Link href="/voice-notes" className={`px-4 py-2 rounded-lg hover:bg-emerald-700 ${isActive('/voice-notes')}`}>
					Voice Notes
				</Link>
				<Link href="/translator" className={`px-4 py-2 rounded-lg hover:bg-emerald-700 ${isActive('/translator')}`}>
					Translator
				</Link>
				<Link href="/ai-writer" className={`px-4 py-2 rounded-lg hover:bg-emerald-700 ${isActive('/ai-writer')}`}>
					AI Writer
				</Link>
				<Link href="/tasks" className={`px-4 py-2 rounded-lg hover:bg-emerald-700 ${isActive('/tasks')}`}>
					Tasks
				</Link>
			</div>
		</nav>
	);
}