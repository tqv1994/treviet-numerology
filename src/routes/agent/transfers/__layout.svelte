<script lang="ts" context="module">
import { packagesStore } from '$lib/stores/package';
import { getMyAgent } from '$lib/utils/user';

	import type { Load } from '@sveltejs/kit';

	export const load: Load = async({fetch, session}) => {
        const agent = getMyAgent(session.user)
        const res = await fetch(`/p/agents/get-packages/${agent.id}`);
        
        if(res.ok){
            const data = await res.json();
            packagesStore.set(data.results);
        }
		return {};
	};
</script>

<slot />
