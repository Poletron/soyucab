import { useState } from 'react';
import { Send, Image, Calendar, X, Loader2 } from 'lucide-react';
import { createPost, uploadImage, CreatePostData, getCurrentUser } from '../services/api';

interface CreatePostProps {
    onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
    const [texto, setTexto] = useState('');
    const [visibilidad, setVisibilidad] = useState<'Público' | 'Solo Conexiones' | 'Privado'>('Público');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const currentUser = getCurrentUser();
    const userPhotoUrl = currentUser?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}`;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!texto.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            // First upload image if exists
            let imageUrl: string | undefined;
            if (imageFile) {
                const uploadResult = await uploadImage(imageFile);
                if (uploadResult.success && uploadResult.url) {
                    imageUrl = uploadResult.url;
                }
            }

            // Create post
            const postData: CreatePostData = {
                texto: imageUrl ? `${texto}\n\n📷 ${imageUrl}` : texto,
                visibilidad,
            };

            const result = await createPost(postData);

            if (result.success) {
                setTexto('');
                setImageFile(null);
                setImagePreview(null);
                onPostCreated?.();
            } else {
                setError(result.error || 'Error al crear publicación');
            }
        } catch (err) {
            setError('Error de conexión');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-3">
                    <img
                        src={userPhotoUrl}
                        alt={currentUser?.name || 'Usuario'}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <textarea
                            value={texto}
                            onChange={(e) => setTexto(e.target.value)}
                            placeholder="¿Qué estás pensando?"
                            className="w-full border-0 resize-none focus:ring-0 text-gray-700 placeholder-gray-400 text-sm min-h-[80px]"
                            rows={3}
                        />

                        {imagePreview && (
                            <div className="relative mt-2 inline-block">
                                <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                        <label className="flex items-center gap-1 text-gray-500 hover:text-blue-600 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <Image size={18} />
                            <span className="text-sm">Foto</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                        <button
                            type="button"
                            className="flex items-center gap-1 text-gray-500 hover:text-green-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Calendar size={18} />
                            <span className="text-sm">Evento</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={visibilidad}
                            onChange={(e) => setVisibilidad(e.target.value as typeof visibilidad)}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="Público">🌍 Público</option>
                            <option value="Solo Conexiones">👥 Conexiones</option>
                            <option value="Privado">🔒 Privado</option>
                        </select>

                        <button
                            type="submit"
                            disabled={!texto.trim() || isLoading}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                            Publicar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
