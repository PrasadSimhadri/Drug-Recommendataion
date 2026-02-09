"""
HGT (Heterogeneous Graph Transformer) Model Definition
For Drug Recommendation System
"""

import torch
import torch.nn as nn
from torch_geometric.nn import HGTConv


class HGT(nn.Module):
    """
    Heterogeneous Graph Transformer encoder.
    Processes heterogeneous graph data with different node and edge types.
    """
    def __init__(self, hidden_channels, num_heads, num_layers, metadata, data):
        super().__init__()

        # Per-node-type linear projection
        self.lin_dict = nn.ModuleDict()
        for node_type in metadata[0]:
            in_channels = data[node_type].x.size(-1)
            self.lin_dict[node_type] = nn.Linear(in_channels, hidden_channels)

        # HGT convolution layers
        self.convs = nn.ModuleList()
        for _ in range(num_layers):
            self.convs.append(
                HGTConv(
                    in_channels=hidden_channels,
                    out_channels=hidden_channels,
                    metadata=metadata,
                    heads=num_heads
                )
            )

    def forward(self, x_dict, edge_index_dict):
        # Project node features
        x_dict = {
            k: self.lin_dict[k](v)
            for k, v in x_dict.items()
        }

        # Apply HGT convolutions
        for conv in self.convs:
            x_dict = conv(x_dict, edge_index_dict)

        return x_dict


class HGTLinkPredictor(nn.Module):
    """
    Link prediction model using HGT encoder.
    Predicts drug recommendations for patients.
    """
    def __init__(self, hidden_channels, metadata, data):
        super().__init__()
        self.encoder = HGT(
            hidden_channels=hidden_channels,
            num_heads=2,
            num_layers=2,
            metadata=metadata,
            data=data
        )

    def forward(self, x_dict, edge_index_dict, edge_label_index):
        z_dict = self.encoder(x_dict, edge_index_dict)
        src, dst = edge_label_index
        return (z_dict['patient'][src] * z_dict['concept'][dst]).sum(dim=1)
