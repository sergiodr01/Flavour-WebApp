import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchIngredients } from '../../api/ingredientApi';
import { createFlavor } from '../../api/flavorApi';
import FlavorForm from '../../components/flavor/FlavorForm';

export default function CreateFlavorPage() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIngredients()
      .then(setIngredients)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(payload) {
    await createFlavor(payload);
    navigate('/flavors');
  }

  if (loading) return <p>Loading ingredients...</p>;

  return (
    <div>
      <h2>Create New Flavor</h2>
      <FlavorForm ingredients={ingredients} onSubmit={handleSubmit} submitLabel="Create Flavor" />
    </div>
  );
}
