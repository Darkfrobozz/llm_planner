<script lang="ts">
  import { onMount } from "svelte";
  import {
    Network,
    DataSet,
    type Edge,
    type Node,
  } from "vis-network/standalone";
  import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";
  import { workBreakdown } from "../lib/llm_call";
  let container: HTMLDivElement;

  let name_of_new = "";

  const options = {
    layout: {
      hierarchical: {
        enabled: true,
        levelSeparation: 150, // vertical spacing between levels
        nodeSpacing: 100, // horizontal spacing between nodes
        treeSpacing: 200,
        direction: "UD", // UD = Up-Down, LR = Left-Right
        sortMethod: "directed",
      },
    },
    edges: {
      arrows: {
        to: true, // default arrow style
      },
    },
    physics: {
      enabled: false,
    },
  };

  //TASKS
  const nodes = new DataSet<Node>();

  //Dependencies
  const edges = new DataSet<Edge>();
  let network: Network;

  onMount(() => {
    network = new Network(container, { nodes, edges }, options);
    network.on("click", (params) => {
      const clickedNodeId = params.nodes[0];
      const clickedNode = nodes.get().find((n) => n.id === clickedNodeId);
      const nodeLabel = clickedNode?.label;

      // info(`This Clicked node: ${clickedNode?.id}`);
      // info(`This Clicked node ${clickedNode?.label}`);
    });
  });

  async function add_node_to_network() {
    nodes.clear();
    edges.clear();
    info("hello");
    const tasks = await workBreakdown(name_of_new, true);
    nodes.add(tasks.map((task) => ({ id: task.id, label: task.task })));
    edges.add(
      tasks.flatMap((task) =>
        task.Dependencies.map((dep) => ({ from: dep, to: task.id })),
      ),
    );
    info("finished");
    network.stabilize();
  }
</script>

<main>
  <input type="text" bind:value={name_of_new} />
  <button on:click={add_node_to_network}>Add Node</button>
  <div bind:this={container} class="graph"></div>
</main>

<style lang="scss">
  main {
    height: 100vh;
  }
  .graph {
    width: 800px;
    height: 800px;
    border: 4px solid black;
  }
</style>
