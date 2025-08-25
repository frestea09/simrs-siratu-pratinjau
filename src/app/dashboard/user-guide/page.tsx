export default function UserGuidePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Panduan Pengguna</h2>
      <p>
        Halaman ini memberikan panduan singkat mengenai penggunaan sistem dan
        peran yang tersedia.
      </p>
      <ul className="list-disc space-y-2 pl-4">
        <li>
          <strong>Admin:</strong> mengelola pengguna, notifikasi, dan pengaturan
          sistem.
        </li>
        <li>
          <strong>Petugas:</strong> mengisi survei, melaporkan insiden, dan
          memantau data.
        </li>
        <li>
          <strong>Pimpinan:</strong> melihat laporan dan dashboard untuk
          pengambilan keputusan.
        </li>
      </ul>
    </div>
  )
}
