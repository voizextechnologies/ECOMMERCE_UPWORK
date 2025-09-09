import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAdminDIYArticles } from '../hooks/useSupabase';
import { DIYArticle } from '../types';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

export function AdminDIYArticleListPage() {
  const { loading, error, fetchAllDIYArticles, deleteDIYArticle } = useAdminDIYArticles();
  const [articles, setArticles] = useState<DIYArticle[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const getArticles = async () => {
      const data = await fetchAllDIYArticles();
      if (data) {
        setArticles(data as DIYArticle[]);
      }
    };
    getArticles();
  }, [refresh, fetchAllDIYArticles]);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the article "${title}"?`)) {
      const success = await deleteDIYArticle(id);
      if (success) {
        setRefresh(prev => !prev);
      } else {
        alert('Failed to delete article.');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading DIY articles...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown-900">DIY Articles</h2>
        <Link to="/admin/articles/new">
          <Button>
            <PlusCircle className="w-5 h-5 mr-2" />
            Add New Article
          </Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center text-gray-600 py-10">No DIY articles found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published At
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{article.title}</div>
                    <div className="text-sm text-gray-500">{article.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.published_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/admin/articles/${article.id}/edit`} className="text-brown-600 hover:text-brown-900 mr-3">
                      <Edit className="w-5 h-5 inline" />
                    </Link>
                    <button onClick={() => handleDelete(article.id, article.title)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
